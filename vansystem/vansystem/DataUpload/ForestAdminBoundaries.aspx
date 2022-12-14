<%@ Page Title="" Language="C#" MasterPageFile="~/VanUser.Master" AutoEventWireup="true" CodeBehind="ForestAdminBoundaries.aspx.cs" Inherits="vansystem.DataUpload.ForestAdminBoundaries" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="app-content">
        <div class="row">
            <div class="col-md-4 col-sm-12">
                <div class="tile">
                    <h3 class="tile-title">How to upload forests' admin boundaries?</h3>
                    <div class="tile-body">
                        <p>Upload the forest boundaries in shapefile format for the predefined admin hierarchy. The forest admin hierarchy can be defined to the site administrator and the hierarchy will be displayed here accordingly.</p>
                        <p>In most of the cases, it will be division, range, block, compartment, and plots. Upload the shapefile for each of these before proceeding.</p>
                        <p>
                            Once uploaded, the shapefile needs to be verified. <a href="/DataVerification/verifyAdminBoundaries"><b>Click here to verify</b></a>.
                        </p>
                        <br>
                        <p><b>Shape file format:</b></p>
                        <p>
                            Field 1: id<br />
                            Field 2: name<br />
                            Field 3: geom<br />
                        </p>
                    </div>
                    <!--div class="tile-footer"><a class="btn btn-primary" href="#">Link</a></div-->
                </div>
            </div>
             <%=Products %>
           
        </div>
    </div>
</asp:Content>
