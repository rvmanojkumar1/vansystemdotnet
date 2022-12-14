using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.Numerics;
using System.Security.Cryptography.X509Certificates;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace vansystem.DataUpload
{
    public partial class ForestAdminBoundaries : System.Web.UI.Page
    {
        clsJson objjson = new clsJson();
        NameValueCollection nvc = new NameValueCollection();
        clsConnnection clscon = new clsConnnection();
        protected void Page_Load(object sender, EventArgs e)
        {

            if (!IsPostBack)
            {

                nvc.Clear();
                nvc.Add("@Operation", "GetUserdetails");
                nvc.Add("@Userid", "adilabad@van");
                nvc.Add("@Password", "van@adilabad");

                DataTable dtuser = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);

                if (dtuser.Rows.Count > 0 && dtuser != null)
                {
                    float statecode = (float)Convert.ToDouble(dtuser.Rows[0]["state_code"]);
                    nvc.Clear();
                    nvc.Add("@Operation", "Getforest_boundary_hierarchy");
                    nvc.Add("@state_code", statecode.ToString());
                    DataTable dttables = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);
                    DataTable dttabledata = new DataTable();
                    if (dttables.Rows.Count > 0 && dttables != null)
                    {
                        load(dttables);
                    }
                }



            }
        }

        public static string Products = string.Empty;
        protected string load(DataTable dttables)
        {
            if (dttables.Rows.Count > 0 && dttables != null)
            {
                Products = string.Empty;
                Products += "<div class='col-md-8 col-sm-12'><div class='tile'><h3 class='tile-title'>Upload Forest Admin Boundaries</h3><div class='tile-body'>";
                for (int i = 0; i < dttables.Rows.Count; i++)
                {
                    string tablename = dttables.Rows[i]["table_name"].ToString();
                    nvc.Clear();
                    nvc.Add("@Operation", "GetTabledata");
                    nvc.Add("@Userid", "adilabad@van");
                    nvc.Add("@TableName", tablename);
                    DataTable dttabledata = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDataUpload]", nvc);

                    if (dttabledata.Rows.Count > 0 && dttabledata != null)
                    {
                        string name = "";
                        for (int n = 0; n < dttabledata.Rows.Count; n++)
                        {
                            if (name == "")
                            {
                                name = dttabledata.Rows[n]["name"].ToString();
                            }
                            else
                            {
                                name += ", "+dttabledata.Rows[n]["name"].ToString();
                            }
                        }
                        int j = i + 1;
                        if (Products == "")
                        {
                            Products = "<form id='uploadFAB_" + j + "' name='uploadFAB_" + j + "' method='post' action='/DataUpload/postForestAdminBoundaries' enctype='multipart/form-data'><div class='row data-upload-wrapper' style='margin-bottom: 20px; margin-right: 2px; margin-left: 2px;'><div class='row col-lg-12'> <div class='col-sm-1'><span class='badge-custom badge-light'>" + j + "</span></div><div class='col-md-9 col-sm-8' id='bndTypeContainer'><div class='alert alert-success' role='alert'><b>Boundaries of following " + dttables.Rows[i]["name"].ToString() + "(s) are already uploaded.</b><br/><div class='row'><div class='col-md-12'>" + name + "</div></div></div></div><div class='col-md-2 col-sm-3'></div><div class='col-md-12 validation-error'></div></div></div></form>";
                        }
                        else
                        {
                            Products += "<form id='uploadFAB_" + j + "' name='uploadFAB_" + j + "' method='post' action='/DataUpload/postForestAdminBoundaries' enctype='multipart/form-data'><div class='row data-upload-wrapper' style='margin-bottom: 20px; margin-right: 2px; margin-left: 2px;'><div class='row col-lg-12'> <div class='col-sm-1'><span class='badge-custom badge-light'>" + j + "</span></div><div class='col-md-9 col-sm-8' id='bndTypeContainer'><div class='alert alert-success' role='alert'><b>Boundaries of following " + dttables.Rows[i]["name"].ToString() + "(s) are already uploaded.</b><br/><div class='row'><div class='col-md-12'>" + name + "</div></div></div></div><div class='col-md-2 col-sm-3'></div><div class='col-md-12 validation-error'></div></div></div></form>";
                        }
                       


                    }
                }

            }
            Products += "</div></div></div>";
            return Products;
        }
    }
}