export const friendlyLookup = {
    svg: "Root",
    g: "Group",
    rect: "Rectangle",
    text: "Text"
};
export const applicableOperations = {
    rect: ["image", "fill", "stroke"],
    text: ["text"],
    image: ["image", "stroke"]
};


export const selectableElements = Object.keys(applicableOperations);
export const hiddenElements = [
    "tspan",
    "defs"
]
