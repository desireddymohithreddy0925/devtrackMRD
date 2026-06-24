using System;
using System.Collections.Generic;

namespace WinHome.Services.System
{
    public class GitService
    {
        private static readonly HashSet<string> SensitiveKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "user.signingkey",
            "http.extraheader",
            "core.askpass",
            "credential.helper"
        };

        public void SetGlobalConfig(Dictionary<string, string> gitConfigs)
        {
            if (gitConfigs == null) return;

            foreach (var config in gitConfigs)
            {
                string key = config.Key;
                string value = config.Value;

                // Mask sensitive information in logs
                string displayValue = IsSensitiveKey(key) ? "********" : value;
                
                Console.WriteLine($"[Git] Setting {key} = {displayValue}...");

                // Normally we would execute the git command here
                // e.g., ExecuteGitCommand($"config --global {key} \"{value}\"");
            }
        }

        private bool IsSensitiveKey(string key)
        {
            if (SensitiveKeys.Contains(key)) return true;

            // Catch-all for any other keys that might contain sensitive data like tokens
            string lowerKey = key.ToLowerInvariant();
            if (lowerKey.Contains("token") || lowerKey.Contains("secret") || lowerKey.Contains("password") || lowerKey.Contains("auth"))
            {
                return true;
            }

            return false;
        }
    }
}
