package com.platform.judge.parser;

import org.springframework.stereotype.Component;

/**
 * InputParser
 *
 * Responsibility: Convert raw test-case input strings into valid Java
 * literal/expression strings that can be embedded directly inside generated
 * Java source code.
 *
 * Supported types:
 *   int        →  "42"              stays as-is
 *   int[]      →  "[1,2,3]"         → "new int[]{1,2,3}"
 *   String     →  hello             → "\"hello\""
 *   String[]   →  ["a","b"]         → "new String[]{\"a\",\"b\"}"
 *   int[][]    →  [[1,2],[3,4]]     → "new int[][]{ new int[]{1,2}, new int[]{3,4} }"
 */
@Component
public class InputParser {

    /**
     * Parse a raw input value into a Java expression string for the given type.
     *
     * @param type  One of: "int", "int[]", "String", "String[]", "int[][]"
     * @param input Raw string representation of the value (e.g. "[1,2,3]")
     * @return A Java-syntax expression string ready to embed in generated code
     * @throws IllegalArgumentException if the type is not supported
     */
    public String parse(String type, String input) {
        if (type == null || input == null) {
            throw new IllegalArgumentException("Type and input must not be null");
        }

        String trimmed = input.trim();

        return switch (type.trim()) {
            case "int"      -> parseIntLiteral(trimmed);
            case "int[]"    -> parseIntArray(trimmed);
            case "String"   -> parseStringLiteral(trimmed);
            case "String[]" -> parseStringArray(trimmed);
            case "int[][]"  -> parseIntMatrix(trimmed);
            default -> throw new IllegalArgumentException("Unsupported input type: " + type);
        };
    }

    // ------------------------------------------------------------------ //
    //  Private helpers                                                     //
    // ------------------------------------------------------------------ //

    /** int: return the value directly — no transformation needed. */
    private String parseIntLiteral(String input) {
        return input;
    }

    /**
     * int[]: "[1,2,3]" → "new int[]{1,2,3}"
     * Strips surrounding brackets and rebuilds as a Java array literal.
     */
    private String parseIntArray(String input) {
        String inner = stripBrackets(input);
        // inner is now "1,2,3"
        String[] parts = splitTopLevel(inner, ',');
        StringBuilder sb = new StringBuilder("new int[]{");
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(parts[i].trim());
        }
        sb.append('}');
        return sb.toString();
    }

    /**
     * String: wrap the raw value with escaped double-quotes.
     * If the value is already surrounded by double-quotes, keep them.
     */
    private String parseStringLiteral(String input) {
        if (input.startsWith("\"") && input.endsWith("\"")) {
            return input; // already a quoted string literal
        }
        // Escape any inner double-quotes just in case
        return "\"" + input.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
    }

    /**
     * String[]: ["a","b","c"] → new String[]{"a","b","c"}
     * Handles quoted elements inside the array.
     */
    private String parseStringArray(String input) {
        String inner = stripBrackets(input);
        String[] parts = splitTopLevel(inner, ',');
        StringBuilder sb = new StringBuilder("new String[]{");
        for (int i = 0; i < parts.length; i++) {
            if (i > 0) sb.append(',');
            String elem = parts[i].trim();
            // Ensure each element is a properly quoted string
            sb.append(parseStringLiteral(elem));
        }
        sb.append('}');
        return sb.toString();
    }

    /**
     * int[][]: "[[1,2],[3,4]]" → "new int[][]{ new int[]{1,2}, new int[]{3,4} }"
     * Splits outer array into individual int[] rows, then re-uses parseIntArray.
     */
    private String parseIntMatrix(String input) {
        String inner = stripBrackets(input);
        // Split at top level, each token is itself a [...] sub-array
        String[] rows = splitTopLevel(inner, ',');

        // Collect contiguous row strings — consecutive elements between '[' and ']'
        // Re-join tokens that belong to the same row
        StringBuilder sb = new StringBuilder("new int[][]{");
        boolean first = true;
        StringBuilder rowBuffer = new StringBuilder();
        int depth = 0;

        for (char c : inner.toCharArray()) {
            if (c == '[') {
                depth++;
                rowBuffer.append(c);
            } else if (c == ']') {
                depth--;
                rowBuffer.append(c);
                if (depth == 0) {
                    // Finished one row
                    if (!first) sb.append(',');
                    sb.append(parseIntArray(rowBuffer.toString().trim()));
                    rowBuffer.setLength(0);
                    first = false;
                }
            } else if (depth > 0) {
                rowBuffer.append(c);
            }
            // Characters at depth==0 (e.g. commas between rows) are separators — skip
        }

        sb.append('}');
        return sb.toString();
    }

    // ------------------------------------------------------------------ //
    //  Utility methods                                                     //
    // ------------------------------------------------------------------ //

    /** Remove the outermost '[' ']' pair from a string. */
    private String stripBrackets(String s) {
        String t = s.trim();
        if (t.startsWith("[") && t.endsWith("]")) {
            return t.substring(1, t.length() - 1);
        }
        return t;
    }

    /**
     * Split a string by {@code delimiter}, but only at the top nesting level
     * (i.e. ignores delimiters that appear inside '[]' or '"..."').
     */
    private String[] splitTopLevel(String s, char delimiter) {
        java.util.List<String> parts = new java.util.ArrayList<>();
        int depth = 0;
        boolean inString = false;
        StringBuilder current = new StringBuilder();

        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '"' && (i == 0 || s.charAt(i - 1) != '\\')) {
                inString = !inString;
                current.append(c);
            } else if (!inString && c == '[') {
                depth++;
                current.append(c);
            } else if (!inString && c == ']') {
                depth--;
                current.append(c);
            } else if (!inString && depth == 0 && c == delimiter) {
                parts.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        if (current.length() > 0) {
            parts.add(current.toString());
        }
        return parts.toArray(new String[0]);
    }
}
