using System;
using System.IO;

namespace WinHome.Services.System
{
    public class ScheduledTaskService
    {
        public void Apply(TaskConfig task)
        {
            foreach (var actionConfig in task.Actions)
            {
                if (actionConfig.Type == "exec")
                {
                    // Fix for #2750: Validate executable path
                    if (string.IsNullOrWhiteSpace(actionConfig.Path))
                    {
                        throw new ArgumentException("Executable path cannot be null or empty.");
                    }

                    if (!File.Exists(actionConfig.Path))
                    {
                        throw new FileNotFoundException($"Executable path does not exist: {actionConfig.Path}");
                    }

                    // Security check: reject shell interpreters to prevent command injection
                    string fileName = Path.GetFileName(actionConfig.Path).ToLower();
                    if (fileName == "cmd.exe" || fileName == "powershell.exe" || fileName == "wscript.exe" || fileName == "cscript.exe")
                    {
                        throw new UnauthorizedAccessException($"Task execution using shell interpreter '{fileName}' is not allowed due to security risks.");
                    }

                    var action = new ExecAction(actionConfig.Path, actionConfig.Arguments, actionConfig.WorkingDirectory);
                    // Continue with task registration...
                }
            }
        }
    }

    public class TaskConfig
    {
        public ActionConfig[] Actions { get; set; }
    }

    public class ActionConfig
    {
        public string Type { get; set; }
        public string Path { get; set; }
        public string Arguments { get; set; }
        public string WorkingDirectory { get; set; }
    }

    public class ExecAction
    {
        public ExecAction(string path, string arguments, string workingDirectory) { }
    }
}
