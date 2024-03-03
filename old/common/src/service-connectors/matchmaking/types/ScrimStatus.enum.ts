export enum ScrimStatus {
    /**
     * Scrim is waiting for players
     */
    PENDING = "PENDING",
    /**
     * Scrim has filled, and players are checking in
     */
    POPPED = "POPPED",
    /**
     * Players are playing
     */
    IN_PROGRESS = "IN_PROGRESS",
    /**
     * All players have left before scrim popped.
     * Scrim is being removed, this state is used for event broadcast
     */
    EMPTY = "EMPTY",
    /**
     * Replays are submitted, this scrim is being removed
     * This state is used for event broadcast
     */
    COMPLETE = "COMPLETE",
    /**
     * One or more players have not checked into the queue
     * Players will be queue banned and scrim will be removed
     */
    CANCELLED = "CANCELLED",
    /**
     * A locked scrim has manually been moved to this state by a support member,
     * and needs to be handled by a support team member
     */
    LOCKED = "LOCKED",
}
