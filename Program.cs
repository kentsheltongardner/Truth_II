﻿using System;
using System.IO;
using System.Text.RegularExpressions;
using static System.IO.Directory;
using static System.IO.Path;

namespace HTMLBuilder
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Begin HTML generation\n");
            GenerateHTML(GetCurrentDirectory());
            Console.WriteLine("\nEnd HTML generation");
            Console.Read();
        }
        public static void GenerateHTML(string directory)
        {
            Console.WriteLine("Generating HTML in directory " + directory);
            string[] files = Directory.GetFiles(directory);
            for (int i = 0; i < files.Length; i++)
            {
                if (GetExtension(files[i]) == ".txt")
                {
                    Console.WriteLine("Generating HTML from " + GetFileName(files[i]));
                    string html = HTMLFromTXT(files[i]);
                    File.WriteAllText(GetFileNameWithoutExtension(files[i]) + ".html", html);
                }
            }
            string[] directories = GetDirectories(directory);
            for (int i = 0; i < directories.Length; i++)
            {
                GenerateHTML(directories[i]);
            }
        }
        public static string HTMLFromTXT(string path)
        {
            string allText = File.ReadAllText(path);
            Regex linkRegex = new Regex(@"\[.*]");
            allText = linkRegex.Replace(allText, delegate (Match m) {
                string link = m.Value;
                link = link.Trim('[', ']');
                string[] split = link.Split(':');
                string[] hashSplit = split[1].Split('#');
                bool hash = hashSplit.Length > 1;
                return "<span class=\"link\" data-path=\"" + hashSplit[0] + ".html" + (hash ? "#" + hashSplit[1] : "") + "\">" + split[0] + "</span>";
            });

            string[] blocks = allText.Split('|');

            string html = blocks[0].Trim() + "\n";
            for (int i = 1; i < blocks.Length; i++)
            {
                string block = blocks[i].Trim();
                int dataIndex = Regex.Match(block, @"\s").Index;
                string data = block.Substring(0, dataIndex);
                string text = block.Substring(dataIndex).Trim();
                string[] splitData = data.Split('#');
                string type = splitData[0];
                string id = "";

                if (splitData.Length > 1)
                {
                    id = " id=\"" + splitData[1] + "\"";
                }
                if (ValidType(type))
                {
                    string htmlType = "";
                    switch (splitData[0])
                    {
                        case "2": htmlType = "h2"; break;
                        case "3": htmlType = "h3"; break;
                        case "4": htmlType = "h4"; break;
                        case "p": htmlType = "p"; break;
                        case "i": htmlType = "img"; break;
                    }
                    string[] splitText = text.Split('*');
                    bool note = splitText.Length == 2;
                    string contentHTML = "";
                    if (htmlType == "img")
                    {
                        contentHTML = "<div><img src=\"images/" + splitText[0] + "\"" + id + "></div>";
                    }
                    else
                    {
                        contentHTML = "<" + htmlType + id + ">" + splitText[0] + "</" + htmlType + ">";
                    }
                    string noteHTML = note ? "<aside>" + splitText[1] + "</aside>" : "";
                    string blockHTML = "<div class=\"content-box\">" + contentHTML + noteHTML + "</div>\n";
                    html += blockHTML;
                }
            }
            return html;
        }
        public static bool ValidType(string type)
        {
            switch (type)
            {
                case "2":
                case "3":
                case "4":
                case "p": 
                case "i": return true;
            }
            return false;
        }
    }
}