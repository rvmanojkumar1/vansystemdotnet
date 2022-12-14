using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

using System.Collections;
using System.Data;
using System.Data.SqlClient;
using System.Configuration;
using System.Collections.Specialized;
using System.IO;
using Newtonsoft.Json;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text.RegularExpressions;

using System.Web.Script.Serialization;
using System.Xml;

namespace vansystem
{
    public class clsJson
    {

        public string DataTableToJSONWithJavaScriptSerializer(DataTable table)
        {
            JavaScriptSerializer jsSerializer = new JavaScriptSerializer();
            List<Dictionary<string, object>> parentRow = new List<Dictionary<string, object>>();
            Dictionary<string, object> childRow;
            foreach (DataRow row in table.Rows)
            {
                childRow = new Dictionary<string, object>();
                foreach (DataColumn col in table.Columns)
                {
                    childRow.Add(col.ColumnName, row[col]);
                }
                parentRow.Add(childRow);
            }
            return jsSerializer.Serialize(parentRow);
        }
        public string DataTableToJSONWithStringBuilder(DataTable table)
        {
            var JSONString = new StringBuilder();
            if (table.Rows.Count > 0)
            {
                //JSONString.Append("addresses={ ");
                //JSONString.Append("records");
                //JSONString.Append(": [");
                //JSONString.Append("addresses" + "=" + "{" + "\"" + "records" + "\"" + ":" + " [ ");
                JSONString.Append("addresses" + "=" + "%7B" + "\"" + "records" + "\"" + ":" + " %5B ");

                for (int i = 0; i < table.Rows.Count; i++)
                {
                    //JSONString.Append("{" + "\"" + "attributes" + "\"" + ":" + " {");
                    JSONString.Append("%7B" + "\"" + "attributes" + "\"" + ":" + " %7B");
                    for (int j = 0; j < table.Columns.Count; j++)
                    {
                        if (j < table.Columns.Count - 1)
                        {
                            if (table.Rows[i][j] == table.Rows[0][j])
                            {
                                JSONString.Append(table.Columns[j].ColumnName.ToString().Trim(',').Trim() + ":" + "\"" + table.Rows[i][j].ToString().Trim(',').Trim() + "\",");
                            }
                            else
                            {
                                JSONString.Append("\"" + table.Columns[j].ColumnName.ToString().Trim(',').Trim() + "\":" + "\"" + table.Rows[i][j].ToString().Trim(',').Trim() + "\",");
                            }
                        }


                        else if (j == table.Columns.Count - 1)
                        {


                            JSONString.Append("\"" + table.Columns[j].ColumnName.ToString().Trim(',').Trim() + "\":" + "\"" + table.Rows[i][j].ToString().Trim(',').Trim() + "\"");
                        }
                    }
                    if (i == table.Rows.Count - 1)
                    {
                        //JSONString.Append("}" + "}");
                        JSONString.Append("%7D" + "%7D");
                    }
                    else
                    {
                        //JSONString.Append("}" + "},");
                        //JSONString.Append("%7D" + "%7D,");
                        JSONString.Append("%7D" + "%7D%5D%7D");//changed
                    }
                }
                //JSONString.Append("]");
                //JSONString.Append("}");
                JSONString.Append("%5D");
                JSONString.Append("%7D");
            }
            return JSONString.ToString();
        }

        public string DataTableToJSONWithStringBuilderbulkquery(DataTable table)
        {
            var JSONString = new StringBuilder();
            if (table.Rows.Count > 0)
            {
                //JSONString.Append("addresses={ ");
                //JSONString.Append("records");
                //JSONString.Append(": [");
                //JSONString.Append("addresses" + "=" + "{" + "\"" + "records" + "\"" + ":" + " [ ");
                JSONString.Append("addresses" + "=" + "%7B" + "\"" + "records" + "\"" + ":" + " %5B ");

                for (int i = 0; i < table.Rows.Count; i++)
                {
                    //JSONString.Append("{" + "\"" + "attributes" + "\"" + ":" + " {");
                    JSONString.Append("%7B" + "\"" + "attributes" + "\"" + ":" + " %7B");
                    for (int j = 0; j < table.Columns.Count; j++)
                    {
                        if (j < table.Columns.Count - 1)
                        {
                            if (table.Rows[i][j] == table.Rows[0][j])
                            {
                                JSONString.Append(table.Columns[j].ColumnName.ToString().Trim(',').Trim() + ":" + "\"" + table.Rows[i][j].ToString().Trim(',').Trim() + "\",");
                            }
                            else
                            {
                                JSONString.Append("\"" + table.Columns[j].ColumnName.ToString().Trim(',').Trim() + "\":" + table.Rows[i][j].ToString().Trim(',').Trim() + ",");
                            }
                        }


                        else if (j == table.Columns.Count - 1)
                        {


                            JSONString.Append("\"" + table.Columns[j].ColumnName.ToString().Trim(',').Trim() + "\":" + "\"" + table.Rows[i][j].ToString().Trim(',').Trim() + "\"");
                        }
                    }
                    if (i == table.Rows.Count - 1)
                    {
                        //JSONString.Append("}" + "}");
                        JSONString.Append("%7D" + "%7D");
                    }
                    else
                    {
                        //JSONString.Append("}" + "},");
                        JSONString.Append("%7D" + "%7D,");
                    }
                }
                //JSONString.Append("]");
                //JSONString.Append("}");
                JSONString.Append("%5D");
                JSONString.Append("%7D");
            }
            return JSONString.ToString();
        }

        public DataTable JsonStringToDataTable(string jsonString)
        {
            DataTable dt = new DataTable();
            string[] jsonStringArray = Regex.Split(jsonString.Replace("[", "").Replace("]", ""), "},{");
            List<string> ColumnsName = new List<string>();
            foreach (string jSA in jsonStringArray)
            {
                string[] jsonStringData = Regex.Split(jSA.Replace("{", "").Replace("}", ""), ",");
                foreach (string ColumnsNameData in jsonStringData)
                {
                    try
                    {
                        int idx = ColumnsNameData.IndexOf(":");
                        string ColumnsNameString = ColumnsNameData.Substring(0, idx - 1).Replace("\"", "");
                        if (!ColumnsName.Contains(ColumnsNameString))
                        {
                            ColumnsName.Add(ColumnsNameString);
                        }
                    }
                    catch (Exception ex)
                    {
                        throw new Exception(string.Format("Error Parsing Column Name : {0}", ColumnsNameData));
                    }
                }
                break;
            }
            foreach (string AddColumnName in ColumnsName)
            {
                dt.Columns.Add(AddColumnName);
            }
            foreach (string jSA in jsonStringArray)
            {
                string[] RowData = Regex.Split(jSA.Replace("{", "").Replace("}", ""), ",");
                DataRow nr = dt.NewRow();
                foreach (string rowData in RowData)
                {
                    try
                    {
                        int idx = rowData.IndexOf(":");
                        string RowColumns = rowData.Substring(0, idx - 1).Replace("\"", "");
                        string RowDataString = rowData.Substring(idx + 1).Replace("\"", "");
                        nr[RowColumns] = RowDataString;
                    }
                    catch (Exception ex)
                    {
                        continue;
                    }
                }
                dt.Rows.Add(nr);
            }
            return dt;
        }
        public DataSet GetDataTableFromJsonString(string jsonString)
        {
            jsonString = "{ \"rootNode\": {" + jsonString.Trim().TrimStart('{').TrimEnd('}') + @"} }";
            //// Now it is secure that we have always a Json with one node as root 
            var xd = JsonConvert.DeserializeXmlNode(jsonString);

            //// DataSet is able to read from XML and return a proper DataSet
            var result = new DataSet();
            result.ReadXml(new XmlNodeReader(xd), XmlReadMode.Auto);
            // DataSet ds;



            return result;
        }

        public string[] DatasettoJSONString(DataSet ds)
        {
            if (ds != null)
            {
                string[] val = new string[ds.Tables.Count];
                int i = 0;
                foreach (DataTable tbl in ds.Tables)
                {
                    val[i] = DataTableToJSONWithJavaScriptSerializer(tbl);
                    i++;
                }
                return val;
            }
            else
            {
                return null;
            }
        }
    }
}