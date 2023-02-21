import {palette} from "$lib/palette";

const includedFamilies: Array<keyof typeof palette> = ["primary", "secondary", "accent", "info", "success"];
const includedTints: Array<keyof typeof palette["primary"]> = [500];

const colorPalette = includedTints.flatMap(tint => includedFamilies.map(fam => palette[fam][tint]));

const contrastColor = palette.gray[200];

const axisCommon = () => ({
    nameTextStyle: {
        fontFamily: "Montserrat",
        color: contrastColor,
        fontSize: 14,
    },
    nameLocation: "middle",
    nameGap: 40,
    axisLine: {
        lineStyle: {
            color: contrastColor,
        },
    },
    axisTick: {
        lineStyle: {
            color: contrastColor,
        },
    },
    axisLabel: {
        textStyle: {
            color: contrastColor,
            fontFamily: "Montserrat",
        },
    },
    splitLine: {
        lineStyle: {
            type: "dashed",
            color: "#aaa",
        },
        show: false,
    },
    splitArea: {
        areaStyle: {
            color: contrastColor,
        },
    },
});

export const theme = {
    color: colorPalette,
    backgroundColor: "transparent",
    tooltip: {
        backgroundColor: `${palette.gray[800]}E0`,
        borderColor: "transparent",
        textStyle: {
            color: contrastColor,
            fontFamily: "Montserrat",
            fontWeight: "normal",
        },
        axisPointer: {
            type: "none",
        },
    },
    legend: {
        textStyle: {
            color: contrastColor,
        },
    },
    textStyle: {
        color: contrastColor,
    },
    title: {
        textStyle: {
            color: contrastColor,
        },
    },
    toolbox: {
        iconStyle: {
            normal: {
                borderColor: contrastColor,
            },
        },
    },
    dataZoom: {
        textStyle: {
            color: contrastColor,
        },
    },
    timeline: {
        lineStyle: {
            color: contrastColor,
        },
        itemStyle: {
            normal: {
                color: colorPalette[1],
            },
        },
        label: {
            normal: {
                textStyle: {
                    color: contrastColor,
                },
            },
        },
        controlStyle: {
            normal: {
                color: contrastColor,
                borderColor: contrastColor,
            },
        },
    },
    timeAxis: axisCommon(),
    logAxis: axisCommon(),
    valueAxis: axisCommon(),
    categoryAxis: axisCommon(),

    line: {
        symbol: "circle",
    },
    graph: {
        color: colorPalette,
    },
    gauge: {
        title: {
            textStyle: {
                color: contrastColor,
            },
        },
    },
    candlestick: {
        itemStyle: {
            normal: {
                color: "#FD1050",
                color0: "#0CF49B",
                borderColor: "#FD1050",
                borderColor0: "#0CF49B",
            },
        },
    },
};
