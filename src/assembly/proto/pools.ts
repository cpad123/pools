import { Writer, Reader } from "as-proto";

export namespace pools {
  export class GameState {
    static encode(message: GameState, writer: Writer): void {
      const unique_name_pool_id = message.pool_id;
      if (unique_name_pool_id !== null) {
        writer.uint32(10);
        writer.string(unique_name_pool_id);
      }

      const unique_name_current_token = message.current_token;
      if (unique_name_current_token !== null) {
        writer.uint32(18);
        writer.string(unique_name_current_token);
      }

      if (message.deposit_size != 0) {
        writer.uint32(24);
        writer.uint64(message.deposit_size);
      }

      if (message.game_active != false) {
        writer.uint32(32);
        writer.bool(message.game_active);
      }

      if (message.pool_balance != 0) {
        writer.uint32(40);
        writer.uint64(message.pool_balance);
      }

      const unique_name_winner_address = message.winner_address;
      if (unique_name_winner_address !== null) {
        writer.uint32(50);
        writer.string(unique_name_winner_address);
      }

      if (message.last_winner_pool != 0) {
        writer.uint32(56);
        writer.uint64(message.last_winner_pool);
      }
    }

    static decode(reader: Reader, length: i32): GameState {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new GameState();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.pool_id = reader.string();
            break;

          case 2:
            message.current_token = reader.string();
            break;

          case 3:
            message.deposit_size = reader.uint64();
            break;

          case 4:
            message.game_active = reader.bool();
            break;

          case 5:
            message.pool_balance = reader.uint64();
            break;

          case 6:
            message.winner_address = reader.string();
            break;

          case 7:
            message.last_winner_pool = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    pool_id: string | null;
    current_token: string | null;
    deposit_size: u64;
    game_active: bool;
    pool_balance: u64;
    winner_address: string | null;
    last_winner_pool: u64;

    constructor(
      pool_id: string | null = null,
      current_token: string | null = null,
      deposit_size: u64 = 0,
      game_active: bool = false,
      pool_balance: u64 = 0,
      winner_address: string | null = null,
      last_winner_pool: u64 = 0
    ) {
      this.pool_id = pool_id;
      this.current_token = current_token;
      this.deposit_size = deposit_size;
      this.game_active = game_active;
      this.pool_balance = pool_balance;
      this.winner_address = winner_address;
      this.last_winner_pool = last_winner_pool;
    }
  }

  export class Deposit {
    static encode(message: Deposit, writer: Writer): void {
      const unique_name_player_address = message.player_address;
      if (unique_name_player_address !== null) {
        writer.uint32(10);
        writer.string(unique_name_player_address);
      }

      if (message.amount != 0) {
        writer.uint32(16);
        writer.uint64(message.amount);
      }

      if (message.token != 0) {
        writer.uint32(24);
        writer.uint64(message.token);
      }
    }

    static decode(reader: Reader, length: i32): Deposit {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new Deposit();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.player_address = reader.string();
            break;

          case 2:
            message.amount = reader.uint64();
            break;

          case 3:
            message.token = reader.uint64();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    player_address: string | null;
    amount: u64;
    token: u64;

    constructor(
      player_address: string | null = null,
      amount: u64 = 0,
      token: u64 = 0
    ) {
      this.player_address = player_address;
      this.amount = amount;
      this.token = token;
    }
  }

  export class AdminCommand {
    static encode(message: AdminCommand, writer: Writer): void {
      const unique_name_new_token = message.new_token;
      if (unique_name_new_token !== null) {
        writer.uint32(10);
        writer.string(unique_name_new_token);
      }

      if (message.new_deposit_size != 0) {
        writer.uint32(16);
        writer.uint64(message.new_deposit_size);
      }

      if (message.start_game != false) {
        writer.uint32(24);
        writer.bool(message.start_game);
      }

      if (message.stop_game != false) {
        writer.uint32(32);
        writer.bool(message.stop_game);
      }
    }

    static decode(reader: Reader, length: i32): AdminCommand {
      const end: usize = length < 0 ? reader.end : reader.ptr + length;
      const message = new AdminCommand();

      while (reader.ptr < end) {
        const tag = reader.uint32();
        switch (tag >>> 3) {
          case 1:
            message.new_token = reader.string();
            break;

          case 2:
            message.new_deposit_size = reader.uint64();
            break;

          case 3:
            message.start_game = reader.bool();
            break;

          case 4:
            message.stop_game = reader.bool();
            break;

          default:
            reader.skipType(tag & 7);
            break;
        }
      }

      return message;
    }

    new_token: string | null;
    new_deposit_size: u64;
    start_game: bool;
    stop_game: bool;

    constructor(
      new_token: string | null = null,
      new_deposit_size: u64 = 0,
      start_game: bool = false,
      stop_game: bool = false
    ) {
      this.new_token = new_token;
      this.new_deposit_size = new_deposit_size;
      this.start_game = start_game;
      this.stop_game = stop_game;
    }
  }
}
