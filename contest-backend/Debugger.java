
import java.util.*;
import java.io.*;

class Parameter {
    String name; String type;
    Parameter(String n, String t) { this.name = n; this.type = t; }
    String getName() { return name; }
    String getType() { return type; }
}

class Problem {
    String functionName; String returnType; List<Parameter> parameters;
    Problem(String f, String r, List<Parameter> p) { this.functionName = f; this.returnType = r; this.parameters = p; }
    String getFunctionName() { return functionName; }
    String getReturnType() { return returnType; }
    List<Parameter> getParameters() { return parameters; }
}

public class Debugger {
    public static void main(String[] args) throws Exception {
        testCase("Public Class Case", "public class Solution { public int solve() { return 1; } }", "int", "1");
        testCase("Unknown Type (Object) Case", "class Solution { public int solve(Object x) { return 1; } }", "List<Integer>", "[1,2,3]");
    }
    
    private static void testCase(String title, String userCode, String paramType, String jsonVal) throws Exception {
        System.out.println("\n=== TEST: " + title + " ===");
        Problem problem = new Problem("solve", "int", Arrays.asList(new Parameter("x", paramType)));
        
        // Simulating InputParser.generateJavaDeclaration
        String parsedInputs;
        if (paramType.equalsIgnoreCase("int_array")) {
            parsedInputs = "int[] x = new int[]" + jsonVal.replace("[", "{").replace("]", "}") + ";";
        } else if (paramType.equalsIgnoreCase("int")) {
            parsedInputs = "int x = " + jsonVal + ";";
        } else {
            // This is what happens for unknown types (like List or just bad config)
            parsedInputs = "Object x = " + jsonVal + ";"; 
        }

        String finalCode = generateJavaCode(problem, userCode, parsedInputs);
        
        File debugDir = new File("C:\\temp\\debug");
        if (!debugDir.exists()) debugDir.mkdirs();
        File javaFile = new File(debugDir, "Main.java");
        try (PrintWriter out = new PrintWriter(javaFile)) { out.print(finalCode); }
        
        ProcessBuilder pb = new ProcessBuilder("javac", "Main.java");
        pb.directory(debugDir);
        Process process = pb.start();
        String stderr = readStream(process.getErrorStream());
        int exitCode = process.waitFor();
        
        if (exitCode != 0) {
            System.out.println("FAILURE DETECTED!");
            System.out.println("STDERR:\n" + stderr);
        } else {
            System.out.println("SUCCESS");
        }
    }
    
    private static String readStream(InputStream is) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is))) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line).append("\n");
        }
        return sb.toString();
    }

    private static String generateJavaCode(Problem problem, String userCode, String parsedInputs) {
        return String.format(
            "import java.util.*;\nimport java.io.*;\n\n%s\n\npublic class Main {\n" +
            "    public static void main(String[] args) {\n" +
            "        Solution sol = new Solution();\n        %s\n" +
            "        int result = sol.solve(%s);\n        System.out.println(result);\n    }\n}\n",
            userCode, parsedInputs.replace("\n", "\n        "), "x"
        );
    }
}
