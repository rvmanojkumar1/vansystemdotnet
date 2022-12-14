<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="WebForm2.aspx.cs" Inherits="vansystem.WebForm2" %>


using System;using System.Collections.Generic;using System.Configuration;using System.IO;using System.Linq;using System.Web;namespace GPTV1{    /// <summary>    /// Summary description for FileUpload    /// </summary>    public class FileUpload : IHttpHandler    {        public void ProcessRequest(HttpContext context)        {            if (context.Request.Files.Count > 0)            {                HttpFileCollection files = context.Request.Files;                for (int i = 0; i < files.Count; i++)                {                    HttpPostedFile file = files[i];                    string fname;                    if (HttpContext.Current.Request.Browser.Browser.ToUpper() == "IE" || HttpContext.Current.Request.Browser.Browser.ToUpper() == "INTERNETEXPLORER")                    {                        string[] testfiles = file.FileName.Split(new char[] { '\\' });                        fname = testfiles[testfiles.Length - 1];                    }                    else                    {                        fname = file.FileName;                    }                    string filePath = ConfigurationManager.AppSettings["filePath"].ToString();                                        fname = Path.Combine(filePath, fname);                    file.SaveAs(fname);                }            }            string db = context.Request.Params["database"];            string str = string.Empty;            string methodname = string.Empty;            methodname = context.Request.Params["method"];            //if (methodname.ToLower() == "GetExpandatureValueByBudget")            //{            //    str = GetExpandatureValueByBudget(context);            //}            context.Response.ContentType = "text/plain";            context.Response.Write(str);                     //context.Response.Write("File Uploaded Successfully!");        }        //public string GetExpandatureValueByBudget(HttpContext context)        //{        //    string msg = "";        //    HttpResponse response = context.Response;        //    string catid = context.Request.Params["catid"];        //    string expvalue = context.Request.Params["expvalue"];                  //    return msg;        //}        public bool IsReusable        {            get            {                return false;            }        }    }}



<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="FES">
    <meta name="keyword" content="">
    <link rel="shortcut icon" href="/vali/img/favicon.png" />
	<title>Van - Verify Forest Admin Boundaries</title>
	<link rel="stylesheet" type="text/css" href="/vali/css/main.css">
	<link rel="stylesheet" type="text/css" href="/vali/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="/vali/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="/vali/css/font-awesome-custom.css">
	<link rel="stylesheet" type="text/css" href="/vali/css/custom.css">
	<link rel="stylesheet" type="text/css" href="/global/css/ol4.css">
	<script type="text/javascript" src="/vali/js/jquery-3.2.1.min.js"></script>
</head>
<body class="app  sidebar-mini ">
	<div id="loader">
		<div class="sk-folding-cube">
			<div class="sk-cube1 sk-cube"></div>
			<div class="sk-cube2 sk-cube"></div>
			<div class="sk-cube4 sk-cube"></div>
			<div class="sk-cube3 sk-cube"></div>
			<em>Van</em>
		</div>
	</div>
		<header class="app-header" style="background:#fff;border-bottom:4px solid #004990;">
			<a class="app-sidebar__toggle" href="#" data-toggle="sidebar"></a>
		<a href="/"><img src="/vali/img/van-logo.jpg" alt="logo" /></a>
		<ul class="app-nav">
  <!-- User Menu-->
  <!--li class="dropdown">
    <a class="app-nav__item" href="/Home/about">
      <i class="fa fa-info fa-lg"></i></a>
    </li-->
  <li class="dropdown">
    <a class="app-nav__item" href="#" data-toggle="dropdown"><i class="fa fa-user fa-lg"></i></a>
    <ul class="dropdown-menu settings-menu dropdown-menu-right">
                                  <li>
          <a class="dropdown-item" href="/AppSync/sync">
            <i class="fa fa-refresh fa-lg"></i> Sync Forms
          </a>
        </li>
                <li>
          <a class="dropdown-item" href="/User/account">
            <i class="fa fa-address-book fa-lg"></i> My Account
          </a>
        </li>
        <li>
          <a class="dropdown-item" href="/User/logout">
            <i class="fa fa-sign-in fa-lg"></i> Logout
          </a>
        </li>
          </ul>
  </li>
</ul>	</header>		<!--div class="app-sidebar__overlay" data-toggle="sidebar"></div-->
	<aside class="app-sidebar">
	  <div class="app-sidebar__user"><!--<img class="app-sidebar__user-avatar" src="" alt="User Image">--><span style="display:inline-block; border: 1px solid #fff; background: #36b439; padding: 4px 8px; border-radius: 30px; margin-right: 10px;"><i class="fa fa-user" style="font-size:150%;"></i></span>
		<div>
		  <p class="app-sidebar__user-name">Adilabad</p>
		  <p class="app-sidebar__user-designation"></p>
		</div>
	  </div>
	  <ul class="app-menu">
		<li><a class="app-menu__item" href="/Home/about"><i class="app-menu__icon fa fa-info fa-fw"></i><span class="app-menu__label">About</span></a></li>
				<li><a class="app-menu__item" href="/Home/dashboard"><i class="app-menu__icon fa fa-dashboard fa-fw"></i><span class="app-menu__label">Dashboard</span></a></li>
								<li class="treeview"><a class="app-menu__item" href="#" data-toggle="treeview"><i class="app-menu__icon fa fa-upload fa-fw"></i> <span class="app-menu__label">Data Upload</span><i class="treeview-indicator fa fa-angle-right"></i></a>
		  <ul class="treeview-menu">
			<li><a class="treeview-item" href="/DataUpload/ForestAdminBoundaries"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Forest Admin Boundaries</a></li>
			<li><a class="treeview-item" href="/DataUpload/speciesData"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Species Data</a></li>
			<li><a class="treeview-item" href="/DataUpload/samplingPlots"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Sampling Plots</a></li>
			<li><a class="treeview-item" href="/DataUpload/rareSpeciesData"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>RareSpecies Data</a></li>
		  </ul>  
		</li>
						<li><a class="app-menu__item" href="/DataVerification/verifyAdminBoundaries"><i class="app-menu__icon fa fa-map-o fa-fw"></i> <span class="app-menu__label">Forest Boundaries</span><i class="treeview-indicator fa fa-angle-right"></i></a></li>
						<li class="treeview">
			<a class="app-menu__item" href="#" data-toggle="treeview">
				<i class="app-menu__icon fa fa-edit fa-fw"></i>
				<span class="app-menu__label">NWPC Forms</span>
				<i class="treeview-indicator fa fa-angle-right fa-fw"></i>
			</a>
						<ul class="treeview-menu">
																				<li><a class="treeview-item" href="/DataEdit/listData?form=5"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Plot Approach</a></li>
																				<li><a class="treeview-item" href="/DataEdit/listData?form=2"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Plot Description</a></li>
																				<li><a class="treeview-item" href="/DataManager/listData?form=enumeration"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Plot Enumeration</a></li>
																				<li><a class="treeview-item" href="/DataEdit/listData?form=4"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Village Level Information</a></li>
																				<li><a class="treeview-item" href="/DataEdit/listData?form=6"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Household</a></li>
																				<li><a class="treeview-item" href="/Extraction/getTimberExtraction"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Timber Extraction</a></li>
																				<li><a class="treeview-item" href="/Extraction/getNTFPExtraction"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> NTFP extraction</a></li>
							</ul>
					</li>
						<li class="treeview">
			<a class="app-menu__item" href="#" data-toggle="treeview">
				<i class="app-menu__icon fa fa-tasks fa-fw"></i>
				<span class="app-menu__label">Biodiversity Services</span>
				<i class="treeview-indicator fa fa-angle-right fa-fw"></i>
			</a>
			<ul class="treeview-menu">
				<li>
					<a class="treeview-item" href="/DataView/rareSpecies">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Rare Species Information
					</a>
				</li>
				<li>
					<a class="treeview-item" href="/DataView/labelList">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Label List
					</a>
				</li>
				<!-- <li>
					<a class="treeview-item" href="/DataView/listLabelData">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Label Data
					</a>
				</li>
				<li>
					<a class="treeview-item" href="/DataView/listForm">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Assign List to User
					</a>
				</li> -->
			</ul>
		</li>
		<li class="treeview">
			<a class="app-menu__item" href="#" data-toggle="treeview">
				<i class="app-menu__icon fa fa-tasks fa-fw"></i>
				<span class="app-menu__label">Ecosystem Services</span>
				<i class="treeview-indicator fa fa-angle-right fa-fwt"></i>
			</a>
			<ul class="treeview-menu">
				<li>
					<a class="treeview-item" href="/DataView/provisioning">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Provision Services
					</a>
				</li>
				<li>
					<a class="treeview-item" href="/DataView/hydrological">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Hydrological Services
					</a>
				</li>
				<li>
					<a class="treeview-item" href="/DataView/cultural">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Cultural/Tourism Services
					</a>
				</li>
			</ul>
		</li>
						<li class="treeview">
			<a class="app-menu__item" href="#" data-toggle="treeview">
				<i class="app-menu__icon fa fa-file-text-o fa-fw"></i>
				<span class="app-menu__label">Reports</span>
				<i class="treeview-indicator fa fa-angle-right fa-fw"></i>
			</a>
			<ul class="treeview-menu">
								<li>
					<a class="treeview-item" href="/Report/carbonEstimation">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Carbon Estimation
					</a>
				</li>
												<li>
					<a class="treeview-item" href="/Report/growingStock">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Growing Stock
					</a>
				</li>
												<li>
					<a class="treeview-item" href="/Report/shannonDiversity">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Shannon Diversity Index
					</a>
				</li>
												<li>
					<a class="treeview-item" href="/Report/simpsonDiversity">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Simpson Diversity Index
					</a>
				</li>
												<li>
					<a class="treeview-item" href="/Report/ivIndex">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Importance Value Index (IVI)
					</a>
				</li>
												<li>
					<a class="treeview-item" href="/Report/download">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Tabular Reports
					</a>
				</li>
							</ul>
		</li>
						<li><a class="app-menu__item" href="/GisDashboard/getGisDashboard"><i class="app-menu__icon fa fa-globe fa-fw"></i><span class="app-menu__label">GIS Dashboard</span></a></li>
						<li class="treeview">
			<a class="app-menu__item" href="#" data-toggle="treeview">
				<i class="app-menu__icon fa fa-user fa-fw"></i>
				<span class="app-menu__label">User Management</span>
				<i class="treeview-indicator fa fa-angle-right fa-fw"></i>
			</a>
			<ul class="treeview-menu">
				<li><a class="treeview-item" href="/User/getUsers"><i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i> Users</a></li>
							</ul>
		</li>
						<li class="treeview">
			<a class="app-menu__item" href="#" data-toggle="treeview">
				<i class="app-menu__icon fa fa-download fa-fw"></i>
					<span class="app-menu__label">Working Plan</span>
				<i class="treeview-indicator fa fa-angle-right fa-fw"></i>
			</a>
			<ul class="treeview-menu">
				<li>
					<a class="treeview-item" href="/WorkingPlan/downloadV1">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Draft Volume I
					</a>
				</li>
				<li>
					<a class="treeview-item" href="/WorkingPlan/downloadV2">
						<i class="icon fa fa-dot-circle-o fa-xxs fa-fw"></i>Draft Volume II
					</a>
				</li>
			</ul>  
		</li>
			  </ul>
	</aside>
	<script>
	var baseUrl = "https://";
	var username = "adilabad@van";
	var uploadStatus = 1;
	var dpurl = "https://database.vanapp.org/geoserver";
</script>
<script type="text/javascript">var center = [78.6376512395771, 19.6273983953445]; </script>
<style type="text/css">
	#map {
		border: 1px solid #cecece;
		height: calc(80vh);
		width: 100%;
	}
	#legend .label {
		color: #000;
	}
</style>
<link rel="stylesheet" href="/vali/css/ol3.css" type="text/css" />
<link rel="stylesheet" href="/vali/css/map.css" type="text/css" />
<div class="app-content pd10">
	<div class="col-md-12"><h3>View Forest boundaries</h3></div>
	<div class="clearfix"></div>
	<div style="padding: 15px 0;">
					<div class="col-md-4 col-sm-12">
				<div class="tile">
					<div id="layerController"></div><br />
											<p>All forest boundaries are uploaded. Proceed to upload species list using <a href="/DataUpload/speciesData">this link</a> Upload species list.</p>
						<p>Create data entry users and start data collection after uploading species list.</p>
										<!--
					<h3 class="tile-title">Key points to look for verification of forest boundaries</h3>
					<div class="tile-body"><p><b>This block will contain step wise tutorial to upload boundaries data.</b><br><br>This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content </p><p> This is dummy content. This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content This is dummy content </p><br></div>
					-->
					<!--div class="tile-footer"><a class="btn btn-primary" href="#">Link</a></div-->
				</div>
			</div>
			<div class="col-md-8 col-sm-12" style="max-height: 85vh;">
				<div class="tile">
					<div id="map" style="position: relative;">
						<div id="legend">
							<div id="legendTitleBar">Legend</div>
							<div id="legendContent"></div>
						</div>
					</div>
				</div>
			</div>
			</div>
</div>
<script src="/vali/js/plugins/sweetalert.min.js"></script>
<script src="/vali/js/ol3.js"></script>
<script src="/vali/js/ol3gm.js"></script>
<script src="/vali/js/verify-admin-boundaries.js"></script>
	<div id="dataModal" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog"
		aria-labelledby="myLargeModalLabel" aria-hidden="true">
		<div class="modal-dialog" role="document">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title">Update Field</h5>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary saveFieldChanges">Save changes</button>
					<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
				</div>
			</div>
		</div>
	</div>
	<script type="text/javascript" src="/vali/js/plugins/chart.js"></script>
	<script src="/vali/js/plugins/pace.min.js"></script>
	<script src="/vali/js/popper.min.js"></script>
	<script src="/vali/js/bootstrap.min.js"></script>
	<script src="/vali/js/main.js"></script>
	<script src="/vali/js/custom.js"></script>
</body>
</html>