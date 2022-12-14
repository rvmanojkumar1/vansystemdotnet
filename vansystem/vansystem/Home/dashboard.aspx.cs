using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Configuration;
using System.Collections.Specialized;

namespace vansystem.Home
{
    public partial class dashboard2 : System.Web.UI.Page
    {
        clsJson objjson = new clsJson();
        NameValueCollection nvc = new NameValueCollection();
        clsConnnection clscon = new clsConnnection();
        SqlConnection con = new SqlConnection(ConfigurationManager.ConnectionStrings["ConnStringStr"].ConnectionString);
        protected void Page_Load(object sender, EventArgs e)
        {
            if (!IsPostBack)
            {

                DropDown();
                GetTables();
            }
        }
        private void DropDown()
        {

            SqlCommand cmd = new SqlCommand("exec [dbo].[SpDashboard] 'GetDllInfo','',''", con);
            con.Open();
            SqlDataReader dr = cmd.ExecuteReader();
            DataTable dt = new DataTable();
            dt.Load(dr);
            if (dt.Rows.Count > 0)

            {
                for (int i = 0; i < dt.Rows.Count; i++)
                {

                    ddlselectform.DataSource = dt;
                    ddlselectform.DataTextField = "description";
                    ddlselectform.DataValueField = "f_id";
                    ddlselectform.DataBind();
                    ddlselectform.Items.Insert(0, "Select Form");
                }
            }

            con.Close();
        }
        protected void ddlselectform_SelectedIndexChanged(object sender, EventArgs e)
        {
            string fid = ddlselectform.SelectedValue.ToString();
            nvc.Clear();
            nvc.Add("@Operation", "GetTotalSurveys");
            nvc.Add("@f_id", fid);
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata10 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            for (int i = 0; i < dtchartdata10.Rows.Count; i++)
            {
                string cell = dtchartdata10.Rows[i]["Totalplotssurveyed"].ToString();

                lbltsc2.Text = cell;






            }
            //lbltotplotapp.Text = Convert.ToString(dtchartdata10);
            lbltsc2.DataBind();
        }
        private void GetTables()
        {
            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "5");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVplotapproach.DataSource = dtchartdata;
            GVplotapproach.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "2");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata1 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVplotdiscription.DataSource = dtchartdata1;
            GVplotdiscription.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "3");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata2 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVplotenumeration.DataSource = dtchartdata2;
            GVplotenumeration.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "4");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata3 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVvillagelevelinformation.DataSource = dtchartdata3;
            GVvillagelevelinformation.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "6");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata4 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVhousehold.DataSource = dtchartdata4;
            GVhousehold.DataBind();



            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "7");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata5 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVtimberextarction.DataSource = dtchartdata5;
            GVtimberextarction.DataBind();


            nvc.Clear();
            nvc.Add("@Operation", "GetTableInfo");
            nvc.Add("@f_id", "8");
            nvc.Add("@user_id", "adilabad@van");

            DataTable dtchartdata6 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVNTFPextraction.DataSource = dtchartdata6;
            GVNTFPextraction.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetProvisionservices");
            nvc.Add("@f_id", "");
            nvc.Add("@user_id", "");

            DataTable dtchartdata7 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVprovisioningservices.DataSource = dtchartdata7;
            GVprovisioningservices.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetHydrologicalservices");
            nvc.Add("@f_id", "");
            nvc.Add("@user_id", "");

            DataTable dtchartdata8 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVhydrologicalservices.DataSource = dtchartdata8;
            GVhydrologicalservices.DataBind();

            nvc.Clear();
            nvc.Add("@Operation", "GetCulturalservices");
            nvc.Add("@f_id", "");
            nvc.Add("@user_id", "");

            DataTable dtchartdata9 = clscon.fnExecuteProcedureSelectWithCondtion("[VanSystem].[dbo].[SpDashboard]", nvc);
            GVculturalservices.DataSource = dtchartdata9;
            GVculturalservices.DataBind();


        }
    }
}