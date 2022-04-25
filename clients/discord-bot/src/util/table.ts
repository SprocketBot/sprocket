const HORIZONTAL = "─";
const VERTICAL = "│";
const DOWN_AND_RIGHT = "┌";
const DOWN_AND_LEFT = "┐";
const UP_AND_RIGHT = "└";
const UP_AND_LEFT = "┘";
const VERTICAL_AND_RIGHT = "├";
const VERTICAL_AND_LEFT = "┤";
const HORIZONTAL_AND_DOWN = "┬";
const HORIZONTAL_AND_UP = "┴";
const HORIZONTAL_AND_VERTICAL = "┼";

export const table = (data: string[][], headers: string[]): string => {
    if (!data.length) return "";
    if (headers.length !== data[0].length) throw new Error("Number of headers doesn't match number of columns");
    
    const widths: number[] = Array<number>(headers.length).fill(0);
    data.forEach(row => {
        widths.forEach((_, w) => {
            widths[w] = Math.max(widths[w], row[w].length);
        });
    });

    let topLine = "";
    let middleLine = "";
    let bottomLine = "";

    for (let w = 0; w < widths.length; w++) {
        const horizontal = HORIZONTAL.repeat(widths[w] + 2);
        
        if (w === 0) {
            topLine += DOWN_AND_RIGHT;
            middleLine += VERTICAL_AND_RIGHT;
            bottomLine += UP_AND_RIGHT;
        } else {
            topLine += HORIZONTAL_AND_DOWN;
            middleLine += HORIZONTAL_AND_VERTICAL;
            bottomLine += HORIZONTAL_AND_UP;
        }

        topLine += horizontal;
        middleLine += horizontal;
        bottomLine += horizontal;

        if (w === widths.length - 1) {
            topLine += DOWN_AND_LEFT;
            middleLine += VERTICAL_AND_LEFT;
            bottomLine += UP_AND_LEFT;
        }
    }

    let header = "";

    for (let c = 0; c < headers.length; c++) {
        header += `${VERTICAL} ${headers[c].padStart(widths[c])} `;

        if (c === headers.length - 1) header += VERTICAL;
    }


    let lines = "";

    for (const row of data) {
        let line = "";

        for (let c = 0; c < row.length; c++) {
            line += `${VERTICAL} ${row[c].padStart(widths[c])} `;

            if (c === row.length - 1) line += VERTICAL;
        }
        lines += `${line}\n`;
    }

    return `${topLine}\n${header}\n${middleLine}\n${lines}${bottomLine}`;
};
