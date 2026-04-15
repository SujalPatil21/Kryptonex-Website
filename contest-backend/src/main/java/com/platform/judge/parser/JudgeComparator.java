package com.platform.judge.parser;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class JudgeComparator {

    public boolean isEqual(Object actual, Object expected, String returnType) {
        if (actual == null && expected == null) return true;
        if (actual == null || expected == null) return false;

        switch (returnType.toLowerCase()) {
            case "int":
            case "string":
                return actual.equals(expected);
            case "int_array":
            case "string_array":
                if (actual instanceof List && expected instanceof List) {
                    List<?> actualList = (List<?>) actual;
                    List<?> expectedList = (List<?>) expected;
                    return actualList.equals(expectedList);
                }
                // Fallback to string processing if parsing failed and returned raw strings
                return actual.toString().equals(expected.toString());
            default:
                return actual.toString().equals(expected.toString());
        }
    }
}
