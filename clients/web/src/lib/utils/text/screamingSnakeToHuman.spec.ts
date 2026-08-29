import {screamingSnakeToHuman} from "./screamingSnakeToHuman";

describe("screamingSnakeToHuman", () => {
    it("converts screaming snake case to human readable text", () => {
        expect(screamingSnakeToHuman("ROUND_ROBIN")).toBe("Round Robin");
        expect(screamingSnakeToHuman("IN_PROGRESS")).toBe("In Progress");
        expect(screamingSnakeToHuman("TEAMS")).toBe("Teams");
    });

    it("handles a single word", () => {
        expect(screamingSnakeToHuman("PENDING")).toBe("Pending");
    });

    it("handles empty string", () => {
        expect(screamingSnakeToHuman("")).toBe("");
    });
});