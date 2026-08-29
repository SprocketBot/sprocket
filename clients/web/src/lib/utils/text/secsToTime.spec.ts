import {secsToTime} from "./secsToTime";

describe("secsToTime", () => {
    it("formats seconds as HH:MM:SS", () => {
        expect(secsToTime(0)).toBe("00:00:00");
        expect(secsToTime(3661)).toBe("01:01:01");
        expect(secsToTime(86399)).toBe("23:59:59");
    });
});