import { Game } from "./Pools";
import { Protobuf } from "@koinos/sdk-as";
import { pools } from "./proto/pools";

// Define the main contract class which will be instantiated when the contract is deployed
@contract
export class GameContract {
  private _game: Game;

  constructor() {
    // Initialize the Game instance. This assumes Game has a constructor that sets up initial state
    this._game = new Game();
  }

  @action
  deposit(args: lotto.Deposit): void {
    this._game.deposit(args);
  }

  @action
  adminControl(args: lotto.AdminCommand): void {
    this._game.adminControl(args);
  }

  // Example query action to get the current state of the game
  @query
  getState(): lotto.GameState {
    return this._game.getState();
  }

  // This function is called once when the contract is deployed
  @constructor
  onDeploy(args: any): void {
    // Here you might initialize any contract-wide settings or state
    // For example, set initial game parameters if not set by constructor of Game
  }
}

// Export the Game class for any direct usage or testing
export { Game };