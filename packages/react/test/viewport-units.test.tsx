import { test, expect } from 'vitest';
import React from 'react';
import { Box, Text } from '../src/index';
import { renderToString } from './helpers/render-to-string';

test('resolve 100vw to terminal width', () => {
    const terminalWidth = 100;
    const terminalHeight = 24;
    
    const output = renderToString(
        <Box style={{ width: '100vw' }}>
            <Text>X</Text>
        </Box>,
        {
            columns: terminalWidth,
            rows: terminalHeight
        }
    );

    expect(output).toBe('X');
});

test('resolve 50vw to half terminal width', () => {
    const terminalWidth = 100;
    const output = renderToString(
        <Box style={{ width: '50vw' }}>
            <Text>X</Text>
        </Box>,
        {
            columns: terminalWidth,
        }
    );

    expect(output).toBe('X');
});

test('center a box using viewport units', () => {
    const terminalWidth = 100;
    const terminalHeight = 24;
    
    const output = renderToString(
        <Box style={{ width: '100vw', justifyContent: 'center' }}>
            <Box style={{ width: '10vw' }}>
                <Text>X</Text>
            </Box>
        </Box>,
        {
            columns: terminalWidth,
            rows: terminalHeight
        }
    );

    expect(output.startsWith(' '.repeat(45) + 'X')).toBe(true);
});

test('resolve 100vh to terminal height', () => {
    const terminalHeight = 50;
    const output = renderToString(
        <Box style={{ height: '100vh', flexDirection: 'column' }}>
            <Text>A</Text>
            <Box style={{ flexGrow: 1 }} />
            <Text>B</Text>
        </Box>,
        {
            rows: terminalHeight,
        }
    );

    const lines = output.split('\n');
    expect(lines.length).toBe(terminalHeight);
    expect(lines[0]?.trim()).toBe('A');
    expect(lines[lines.length - 1]?.trim()).toBe('B');
});

test('vmin and vmax units', () => {
    const terminalWidth = 100;
    const terminalHeight = 50;
    
    // vmin = min(100, 50) = 50. 10vmin = 5 cells.
    const outputVmin = renderToString(
        <Box style={{ width: '100vw', justifyContent: 'center' }}>
            <Box style={{ width: '10vmin' }}>
                <Text>X</Text>
            </Box>
        </Box>,
        {
            columns: terminalWidth,
            rows: terminalHeight
        }
    );
    // (100 - 5) / 2 = 47.5 -> 48 or 47? Yoga/Taffy rounding.
    // Let's check if it's around 47-48 spaces.
    expect(outputVmin.indexOf('X')).toBeGreaterThan(40);
    expect(outputVmin.indexOf('X')).toBeLessThan(50);

    // vmax = max(100, 50) = 100. 10vmax = 10 cells.
    const outputVmax = renderToString(
        <Box style={{ width: '100vw', justifyContent: 'center' }}>
            <Box style={{ width: '10vmax' }}>
                <Text>X</Text>
            </Box>
        </Box>,
        {
            columns: terminalWidth,
            rows: terminalHeight
        }
    );
    // (100 - 10) / 2 = 45.
    expect(outputVmax.startsWith(' '.repeat(45) + 'X')).toBe(true);
});
