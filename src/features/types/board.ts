export type SquareType = 
| "START"
| "PROPERTY"
| "TAX"
| "CHANCE"
| "JAIL"
| "FREE_PARKING";

export interface BoardSquare {
    id: string;
    index: number;
    name: string;
    type: SquareType;
}

export interface PropertySquare extends BoardSquare {
    type: "PROPERTY";
    price: number;
    rent: number;
    colorGroup: string;
}