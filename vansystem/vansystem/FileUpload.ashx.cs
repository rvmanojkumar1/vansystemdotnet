using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Web;

namespace vansystem
{
    /// <summary>
    /// Summary description for FileUpload
    /// </summary>
    public class FileUpload : IHttpHandler
    {


        public void ProcessRequest(HttpContext context)
        {
            if (context.Request.Files.Count > 0)
            {
                HttpFileCollection files = context.Request.Files;
                for (int i = 0; i < files.Count; i++)
                {
                    HttpPostedFile file = files[i];
                    string fname;
                    if (HttpContext.Current.Request.Browser.Browser.ToUpper() == "IE" || HttpContext.Current.Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")
                    {
                        string[] testfiles = file.FileName.Split(new char[] { '\\' });
                        fname = testfiles[testfiles.Length - 1];
                    }
                    else
                    {
                        fname = file.FileName;
                    }

                    string filePath = ConfigurationManager.AppSettings["filePath"].ToString();

                    fname = Path.Combine(filePath, fname);
                    file.SaveAs(fname);
                }
            }
            string db = context.Request.Params["database"];
            string str = string.Empty;
            string methodname = string.Empty;
            methodname = context.Request.Params["method"];

           
            context.Response.ContentType = "text/plain";
            context.Response.Write(str);

           
        }
        
        
    public bool IsReusable
        {
            get
            {
                return false;
            }
        }
    }
}