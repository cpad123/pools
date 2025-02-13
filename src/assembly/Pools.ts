import { Protobuf , System, Base58, Token } from "@koinos/sdk-as";
import { pools } from "./proto/pools";
import { getVHPHolders, getVHPBalance } from "./Utils/vhpUtils";
import { isAuthorized } from "./Utils/securityUtils"
import { Display } from "../build/IPools";


const TOKEN_CONTRACT_ID = "your_token_contract_address_here"; // Base58 encoded
const HOLDING_WALLET = "your_holding_wallet_address_here"; // Base58 encoded
const OWNER_WALLET = "your_owner_wallet_address_here"; // Base58 encoded


//*
/*@contract
*/
export class Game {
  private _contractId: Uint8Array;
  private _state: pools.GameState;
  private _token: Token;
  private _chunks: Map<string, pools.GameState> = new Map<string, pools.GameState>();
  private _vhpHolders: Array <string> = []; // List of addresses with more than 1000 VHP
  private _vhpMinGameT: u64 = 5000; // Min amount of VHP holder must have to qualify as a producer
  private _vhpMaxGameT: u64 = 1000000; //Max amount of VHP holder can have to qualify as a producer

  constructor() {
    this._contractId = System.getContractId();
    this._state = new pools.GameState();
    this._token = new Token(Base58.decode(TOKEN_CONTRACT_ID));
    this.loadPools();
  }


    loadPools(chunks: Map<string, pools.GameState>): void {
    // Load pool states from chain storage
    const chunksBytes = Protobuf.get("chunks");
    if (chunksBytes) {
      const chunksMap = Protobuf.decode<pools.chunks>(chunksBytes, pools.chunks.decode);
      for (let i = 0; i < chunksMap.pools.length; i++) {
        pools.set(chunksMap.pools[i].pool_id, chunksMap.pools[i]);
      }
    }
  }
  
    savePools(chunks: Map<string, pools.GameState>): void {
    // Save pool states to chain storage
    let chunksObj = new pools.chunks();
    for (let i = 0; i < chunks.size; i++) {
      let key = chunks.keys()[i];
      let value = chunks.get(key);
      if (value) chunksObj.pools.push(value);
    }
    const encodedChunks = Protobuf.encode(chunksObj, pools.chunks.encode);
    Protobuf.put("chunks", encodedChunks);

  }

  //*
  /*@action
  */
  startGame(args: pools.startGameArgs): void {
    if (!isAuthorized ()) {
      System.log("Unauthorized to start a new game.");
      return;
    }

    // Fetch and filter VHP holders
    this._vhpHolders = getVHPHolders(this._token);
  System.log("VHP Holders list updated.");


    let newPool = new pools.GameState();
    newPool.pool_id = args.pool_id;
    newPool.current_token = args.token_address;
    newPool.deposit_size = args.deposit_size;
    newPool.game_active = true;
    newPool.pool_balance = 0;
    newPool.winner_address = "";
    newPool.last_winner_pool = 0;

    this._chunks.set(newPool.pool_id, newPool);
    this.savePools();
  
  }


  //*
  /*@action
  */
  deposit(args: pools.Deposit): void {
    const caller = System.getCaller (); 
    if (!caller) {
      System.fail ("Code Failed.")
    return;
    }

    let pool = this._chunks.get(args.pool_id);
    if (!pool || !pool.game_active) {
      System.fail("Game not active or pool not found.");
      return;
    }
    if (args.amount != pool.deposit_size) {
      System.fail("Incorrect deposit amount.");
      return;
    }

    // Select a random VHP holder
    System.verify_vrf_proof ();
    const randomVHPHolder = this.selectRandomVHPHolder();
    this._vhpBalance = this.getVHPBalance(randomVHPHolder);

    // Transfer the deposit from the player to the holding wallet
    const success = this._token.transfer(
      Base58.decode(args.player_address), 
      Base58.decode(HOLDING_WALLET), 
      args.amount
    );

    const txId = System.getTransactionField("id")!.bytes_value!;
    const blockProducer = System.getBlockField("producer")!.string_value!;

    System.log(`Transaction ID: ${txId}`);
    System.log(`Block Producer: ${blockProducer}`);

    if (!success) {
      System.fail("Deposit transfer failed");
      return;
    }

    pool.pool_balance += args.amount;


    if (randomVHPHolder === Base58.encode(blockProducer)) {
      if(this._vhpBalance >= this._vhpMinGameT && this._vhpBalance <= this._vhpMaxGameT) {
      this.selectWinner(args.pool_id, args.player_address);
      System.log("User is winner!");
    } else {
      System.log("User not a winner.");
    }
  } else {
    System.log("User not a winner.");
  }

  this.savePools();
  }

  private selectWinner(poolId: string, winner: string): void {
    let pool = this._pools.get(poolId);
    if (!pool) {
      System.fail("Pool not found.");
      return;
    }

    const winnerShare = u64((pool.pool_balance * 90) / 100);
    const feeShare = pool.pool_balance - winnerShare;

    // Transfer 90% to the winner
    const transferToWinnerSuccess = this._token.transfer(
      Base58.decode(HOLDING_WALLET), 
      Base58.decode(winner), 
      winnerShare
    );

    // Transfer 10% to the owner
    const transferToOwnerSuccess = this._token.transfer(
      Base58.decode(HOLDING_WALLET), 
      Base58.decode(OWNER_WALLET), 
      feeShare
    );

    if (!transferToWinnerSuccess || !transferToOwnerSuccess) {
      System.fail("Winner or fee transfer failed");
      return;
    }

    pool.winner_address = winner;
    pool.last_winner_pool = pool.pool_balance;
    pool.pool_balance = 0;
    pool.game_active = false;

    this.savePools();
  }
}