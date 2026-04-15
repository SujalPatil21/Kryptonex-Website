import java.util.*;
import java.io.*;
import java.math.*;

class Solution {
public int[] twoSum(int[] nums, int target) {
    HashMap<Integer, Integer> map = new HashMap<>();

    for (int i = 0; i < nums.length; i++) {
        int need = target - nums[i];
        if (map.containsKey(need)) {
            return new int[]{map.get(need), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}
}

public class Main {
    public static void main(String[] args) {
        int[] nums = new int[]{2,7,11,15};
        int target = 9;
        
        Solution sol = new Solution();
        int[] result = sol.twoSum(nums, target);
        if (result == null || result.length == 0) {
            System.out.println("");
        } else {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < result.length; i++) {
                if (i > 0) sb.append(",");
                sb.append(result[i]);
            }
            System.out.println(sb.toString());
        }
    }
}
