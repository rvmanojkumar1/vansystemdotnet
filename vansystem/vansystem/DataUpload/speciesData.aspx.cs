using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Numerics;
using System.Security.Cryptography.X509Certificates;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;

namespace vansystem.DataUpload
{
    public partial class speciesData : System.Web.UI.Page
    {
        clsJson objjson = new clsJson();
        NameValueCollection nvc = new NameValueCollection();
        clsConnnection clscon = new clsConnnection();
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {

                nvc.Clear();
                nvc.Add("@Operation", "GetallHabits");

                DataTable dthabits = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);

                if (dthabits.Rows.Count > 0 && dthabits != null)
                {

                    load(dthabits);

                }

                loadtopMostParentList();

            }
        }

        public static string Allhabits = string.Empty;
        protected string load(DataTable dthabits)
        {
            if (dthabits.Rows.Count > 0 && dthabits != null)
            {
                Allhabits = string.Empty;

                for (int i = 0; i < dthabits.Rows.Count; i++)
                {
                    if (Allhabits == "")
                    {
                        Allhabits = "<tr> <td>" + dthabits.Rows[i]["name"].ToString() + "</td><td>" + dthabits.Rows[i]["id"].ToString() + "</td><td>" + dthabits.Rows[i]["type"].ToString() + "</td></tr>";
                    }
                    else
                    {
                        Allhabits += "<tr> <td>" + dthabits.Rows[i]["name"].ToString() + "</td><td>" + dthabits.Rows[i]["id"].ToString() + "</td><td>" + dthabits.Rows[i]["type"].ToString() + "</td></tr>";
                    }
                }

            }

            return Allhabits;
        }

        public static string topMostParentList = string.Empty;
        protected string loadtopMostParentList()
        {
            topMostParentList = "";
            nvc.Clear();
            nvc.Add("@Operation", "GetUserdetails");
            nvc.Add("@Userid", "adilabad@van");
            nvc.Add("@Password", "van@adilabad");

            DataTable dtuser = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);
            topMostParentName.InnerText = dtuser.Rows[0]["name"].ToString();
            if (dtuser.Rows.Count > 0 && dtuser != null)
            {
                float statecode = (float)Convert.ToDouble(dtuser.Rows[0]["state_code"]);
                nvc.Clear();
                nvc.Add("@Operation", "Getforest_boundary_hierarchy");
                nvc.Add("@state_code", statecode.ToString());
                DataTable dttables = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);
                if (dttables.Rows.Count > 0 && dttables != null)
                {
                    for (int i = 0; i < dttables.Rows.Count; i++)
                    {
                        string value = dttables.Rows[i]["name"].ToString();
                        if (topMostParentList == "")
                        {

                            topMostParentList = "<option value=" + value + ">" + value + "</option><br>";
                        }
                        else
                        {
                            topMostParentList += "<option value=" + value + ">" + value + "</option><br>";
                        }
                    }
                }
            }

            return topMostParentList;
        }

        protected string btnUpload()
        {

            string Val = "";





            return Val;
        }



        protected void upload_Click(object sender, EventArgs e)
        {
            string filePath = ConfigurationManager.AppSettings["filePath"].ToString();
            string[] filePaths = Directory.GetFiles(filePath);
            DataTable dt = new DataTable();
            foreach (string file in filePaths)
            {

                string csvData;
                using (StreamReader sr = new StreamReader(file))
                {
                    csvData = sr.ReadToEnd().ToString();
                    string[] row = csvData.Split('\n');
                    for (int i = 0; i < row.Count() - 1; i++)
                    {
                        string[] rowData = row[i].Split(',');
                        {
                            if (i == 0)
                            {
                                for (int j = 0; j < rowData.Count(); j++)
                                {
                                    dt.Columns.Add(rowData[j].Trim());
                                }
                            }
                            else
                            {
                                DataRow dr = dt.NewRow();
                                for (int k = 0; k < rowData.Count(); k++)
                                {
                                    dr[k] = rowData[k].ToString();
                                }
                                dt.Rows.Add(dr);
                            }
                        }
                    }


                }


                for (int i = 1; i < dt.Rows.Count; i++)
                {
                    string habitype = dt.Rows[i]["habit type"].ToString().ToLower();
                    nvc.Add("@Operation", "GetHabitId");
                    nvc.Add("@habitType", habitype);
                    DataTable dthabit = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);
                    if (dthabit.Rows.Count > 0 && dthabit != null)
                    {
                    
                    }
                }

            }
        }
    }
}