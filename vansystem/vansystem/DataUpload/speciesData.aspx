<%@ Page Title="" Language="C#" MasterPageFile="~/VanUser.Master" AutoEventWireup="true" CodeBehind="speciesData.aspx.cs" Inherits="vansystem.DataUpload.speciesData" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <title>Van - Upload Species&#039; Data</title>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="app-content">
        <div class="row">
            <div class="col-md-6 col-sm-12">
                <div class="tile">
                    <h3 class="tile-title">How to upload species' data?</h3>
                    <div class="scrollbar tile-body" style="max-height: 400px; overflow-y: scroll;">
                        <p>
                            Upload the species format as mentioned in the steps below: 
					<ul>
                        <li>Reupload the species list after deleting the previously added list.</li>
                        <li>Recheck the list before uploading. (Uploading a wrong file will lead to system error)</li>
                    </ul>
                        </p>
                        <p>

                            <h6>Step 1 :</h6>
                            Find habit id that system understands in following table
					<table class="table table-sm">
                        <thead>
                            <tr>
                                <td>Name</td>
                                <td>Habit Type</td>
                                <td>Habit Name</td>
                            </tr>
                        </thead>
                        <tbody>
                            <%=Allhabits %>
                        </tbody>

                    </table>
                        </p>
                        <p>
                            <h6>Step 2 :</h6>
                            The habit id could be entered referring the above table. Species file should contain Habit Type, Species Id, Local Name, Scientific Name as columns. Please see <b>sample</b> below:
                        </p>
                        <table class="table">
                            <thead>
                                <tr>
                                    <td>Habit Type</td>
                                    <td>Species Id</td>
                                    <td>Local Name</td>
                                    <td>Scientific Name</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>23</td>
                                    <td>Neem</td>
                                    <td>Azadirachta indica</td>
                                </tr>
                                <tr>
                                    <td>9</td>
                                    <td>25</td>
                                    <td>Crow</td>
                                    <td>Corvus Splendens</td>
                                </tr>
                                <tr>
                                    <td>8</td>
                                    <td>24</td>
                                    <td>Frog</td>
                                    <td>Hoplobatrachus tigerinus</td>
                                </tr>
                            </tbody>
                        </table>
                        <div class="alert alert-info">
                            <b>Note:</b> The file must be comma separated ‘CSV’ (comma separated values) file and must consist following columns.
                        </div>
                        <div class="alert alert-danger">
                            <b>Note :</b> Any change in the species list after data collection will lead to loss of collected data.
                        </div>
                    </div>
                    <!--div class="tile-footer"><a class="btn btn-primary" href="#">Link</a></div-->
                </div>
            </div>
            <div class="col-md-6 col-sm-12">
                <div class="tile">
                    <h3 class="tile-title">Upload Species</h3>
                    <div class="tile-body">
                      <%--  <div>
                            <div class="alert alert-success">
                                Already Uploaded
                            </div>
                            <button type="button" class="btn btn-danger" onclick="return deleteSpeciesData();"><i class="fa fa-fw fa-lg fa-times-circle"></i>Delete</button>
                        </div>--%>

                        <div>
                            <form id="uploadSpeciesData" method="post" action="/DataUpload/postSpeciesData" enctype="multipart/form-data">
                                <div id="formContainer">
                                    <div id="parentsWrapper">
                                        <div class="row" style="margin-bottom: 20px;">
                                            <div class="col-md-1"><span class="badge-custom badge-primary">1</span></div>
                                             <div class="col-md-1"></div>
                                            <div class="col-md-10" id="bndTypeContainer">
                                                <div class="form-group">
                                                    <label for="exampleSelect1" id="topMostParentName" runat="server"></label>
                                                   
                                                    <select class="form-control" id="topMostParent" name="topMostparent" onchange="showCSVUpload(this.id)">
                                                        <option value="0">Select</option>
                                                      
                                                         <%=topMostParentList %>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" id="csvUpload" style="margin-bottom: 20px;">
                                        <div class="col-md-1"><span class="badge-custom badge-primary">2</span></div>
                                        <div class="col-md-1"></div>
                                        <div class="col-md-10">
                                            <div class="form-group">
                                                <label for="exampleInputFile">Upload CSV file</label>
                                                <input class="form-control-file" id="csv_file" name="csv_file" type="file" accept=".csv" aria-describedby="fileHelp">
                                                <small class="form-text text-muted" id="fileHelp">Upload comma seperated csv file containing species list</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row" id="submitButton" style="margin-bottom: 20px;">
                                        <div class="col-md-1"><span class="badge-custom badge-primary">3</span></div>
                                        <div class="col-md-1"></div>
                                        <div class="col-md-10">
                                            <div class="tile-footer">
                                               <%-- <button class="btn btn-primary" type="submit" id="upload" onclick="FileUpadate();">Upload</button>--%>
                                               <asp:Button runat="server" onClick="upload_Click" ID="upload" class="btn btn-primary" onkeyup="FileUpadate();" Text="Upload" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <!--div class="tile-footer"><a class="btn btn-primary" href="#">Link</a></div-->
            <!--div class="tile-footer"><a class="btn btn-primary" href="#">Link</a></div-->
        </div>
    </div>

    <script src="/vali/js/plugins/sweetalert.min.js"></script>
    <script src="/vali/js/species-data.js"></script>
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
</asp:Content>
