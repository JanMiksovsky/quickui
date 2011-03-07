/*
 * MaxSquare layout algorithm: Return the column and row dimensions
 * of a table that optimially divides the canvas into at least n cells.
 * 
 * Copyright 2011 Jan Miksovsky. Released under the MIT license.
 *
 * The optimal layout gives the resulting cells the maximum inscribed
 * square. The size of this square is determined by the lesser of the
 * cell's height and width. Suppose we let
 *     w = canvas width
 *     h = canvas height
 * To get the squarest cell, we want the number of rows and columns such that:
 *     w / columns = h / rows
 * If rows * columns = n, we get:
 *     w / columns = h / (n / columns)
 * Solving for columns, we get:
 *     columns = Sqrt(w * n / h)
 *
 * Calculating columns like this will usually not produce an integer, so we
 * try choosing the integers on either side of this value, and pick the
 * choice that produces the cells with the biggest inscribed square.
 * 
 * The canvas width and height are supplied as scalar values, e.g., pixels. 
 */

function maxSquare(canvasWidth, canvasHeight, n) {
    
    if (canvasWidth <= 0 || canvasHeight <= 0 || n <= 0)
    {
        // Degenerate case or error.
        return { columns: 0, rows: 0 };
    }

    // Find the number of columns that optimally divide the canvas into
    // at least n cells such that each cell contains the maximum
    // inscribed square. This column value is hypothetical, since it can
    // easily be a non-integral value.
    var columnsTarget = Math.sqrt((canvasWidth * n) / canvasHeight);

    // First choice: Pick next highest integer.
    var columns1 = Math.ceil(columnsTarget);
    var rows1 = Math.ceil(n / columns1);
    var tableDimensions1 = { columns: columns1, rows: rows1 };

    // Second choice: Pick the next lowest integer.
    var columns2 = Math.floor(columnsTarget);

	if (columns2 == 0 || columns2 == columns1)
	{
		// Second choice is useless or same as first, so use first choice.
		return tableDimensions1;
	}

	var rows2 = Math.ceil(n / columns2);
	var tableDimensions2 = { columns: columns2, rows: rows2 };
	
	// Compare first and second choice to see which produces the
	// cells with the biggest inscribed square.
	var squareLength1 = maxSquare.lengthOfInscribedSquare(canvasWidth, canvasHeight, tableDimensions1);
	var squareLength2 = maxSquare.lengthOfInscribedSquare(canvasWidth, canvasHeight, tableDimensions2);

	if (squareLength2 > squareLength1)
	{
	    // Second choice has bigger squares.
	    return tableDimensions2;
	}
	else if (squareLength2 == squareLength1 &&
	    rows2 * columns2 < rows1 * columns1)
	{
	    // Second choice has cells that hold the same square,
	    // but this choice wastes less space.
	    return tableDimensions2;
	}
	else
	{
		// First choice uses space most efficiently.
		return tableDimensions1;
	}
}

/*
 * If the canvas were divided into these row/column dimensions,
 * return the maximum length of a square that could be inscribed in its cells.
 */
maxSquare.lengthOfInscribedSquare = function(canvasWidth, canvasHeight, tableDimensions)
{
    var cellSize = maxSquare.cellSize(canvasWidth, canvasHeight, tableDimensions);
    return Math.min(cellSize.width, cellSize.height);
}

/*
 * Return the cell size if the canvas is divided with these table dimensions.
 */
maxSquare.cellSize = function(canvasWidth, canvasHeight, tableDimensions) {
    return {
        width: canvasWidth / tableDimensions.columns,
        height: canvasHeight / tableDimensions.rows
    };
}

/*
 * Handles the common case where MaxSquare is used to find the best cell size.
 * The fractional portions of the result are truncated to simplify using
 * this size in rendering images, e.g., with integral pixel sizes. 
 */
maxSquare.optimalCellSize = function(canvasWidth, canvasHeight, n) {
    var tableDimensions = maxSquare(canvasWidth, canvasHeight, n);
    var cellSize = maxSquare.cellSize(canvasWidth, canvasHeight, tableDimensions)
    return {
        width: Math.floor(cellSize.width),
        height: Math.floor(cellSize.height)
    };
}

/*
 * QUnit tests
 */
maxSquare.runTests = function() {

    test("2 items in 1x3 rectangle", function() {
        deepEqual(maxSquare(1, 3, 2), { columns: 1, rows: 2 });
    });

    test("8 items in perfect square", function() {
        deepEqual(maxSquare(1, 1, 8), { columns: 3, rows: 3 });
    });

    test("9 items in perfect square", function() {
        deepEqual(maxSquare(1, 1, 9), { columns: 3, rows: 3 });
    });

    test("9 items in 4x3 rectangle", function() {
        deepEqual(maxSquare(4, 3, 9), { columns: 3, rows: 3 });
    });

    test("10 items in perfect square", function() {
        deepEqual(maxSquare(1, 1, 10), { columns: 4, rows: 3 });
    });

    test("10 items in 4x3 rectangle", function() {
        deepEqual(maxSquare(4, 3, 10), { columns: 4, rows: 3 });
    });

    test("10 items in 5x2 rectangle", function() {
        deepEqual(maxSquare(5, 2, 10), { columns: 5, rows: 2 });
    });

    test("10 items in 10x1 rectangle", function() {
        deepEqual(maxSquare(10, 1, 10), { columns: 10, rows: 1 });
    });

    test("12 items in 12x5 rectangle", function() {
        deepEqual(maxSquare(12, 5, 12), { columns: 6, rows: 2 });
    });
}
