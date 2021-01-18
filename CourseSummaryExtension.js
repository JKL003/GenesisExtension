removeUnnecessaryHeaders();
extractGradeData();
showGradeData();

function removeUnnecessaryHeaders() {
     //Removes unnecessary columns
     var headers = document.getElementsByClassName("headerCategoryTab");
     var headersToDelete = ["Attendance", "Grading", "Scheduling", "Documents", "Course Pages"]
     for(var i = headers.length-1; i>-1; i--) {
          var selectedEl = headers[i];
          var embeddedText = selectedEl.textContent.trim();
          if (headersToDelete.includes(embeddedText)) {     
               try { selectedEl.parentNode.removeChild(selectedEl); }
               catch (err) { console.log("already deleted those headers"); }
          }
     }

     //Removes student switcher
     var studentHeader = document.getElementsByClassName("headerStudentSelector")[0];
     try { studentHeader.parentNode.removeChild(studentHeader); }
     catch (err) { console.log("already deleted those headers"); }
     
 
     //Removes the top bar since logout/settings is pointless
     var topHeader = document.getElementsByClassName("headerModules")[0];
     try { topHeader.parentNode.removeChild(topHeader); }
     catch (err) { console.log("already deleted those headers"); }

}

var mpStartDate = new Date();
var mpEndDate = new Date();
var assignmentList = [];
var assignmentObjectList = [];
var categoryList = [];

function getAssignments() {
     return assignmentList;
}
function setAssignments(newAssignments) {
     assignmentList = newAssignments;
}
function getAssignmentObjs() {
     return assignmentObjectList;
}
function setAssignmentObjs(newAssignmentObjs) {
     assignmentObjectList = newAssignmentObjs;
}
function getCategories() {
     return categoryList;
}
function setCategories(newCategories) {
     categoryList = newCategories;
}


function extractGradeData() {
     var mp = 2;
     var assignments = getAssignments();
     // Get all tables from document
     var tablesHTMLCollec = document.getElementsByClassName("list"); // HTMLCollection
     var tables = Array.prototype.slice.call(tablesHTMLCollec); // array

     // Remove category/weight table from main grade table in tables HTMLCollection
     // Update: may not have worked, added assignments[(currIndex)][0]=="Assignment Name" to fix issue of 
          // last assignment name changing to last category name
     for (var i = (tables[0].length - 1) ; i >= 0; i--) {
          if (tables[0][i].type == "list") {
               tables[0].splice(i, 1);
          }
     }

     // Set marking period start and end dates (shown above main grades table)
     mpDatesRow = tablesHTMLCollec[0].getElementsByTagName("tr")[0];
     mpDatesStr = mpDatesRow.innerHTML;
     mpDatesStr = mpDatesStr.substring(mpDatesStr.indexOf("Marking Period"));
     mpDatesStr = mpDatesStr.substring(0,mpDatesStr.indexOf("</span>")); 
     
     mpStartDateStr = mpDatesStr.split(/\s/)[2];
     mpStartDateStr = mpStartDateStr.substring(mpStartDateStr.length - 8)
     mpEndDateStr = mpDatesStr.split(/\s/)[4];
     mpEndDateStr = mpEndDateStr.substring(0,8);

     mpStartDateStr = mpStartDateStr.split("/");
     mpEndDateStr = mpEndDateStr.split("/");

     var today = new Date();
     mpStartDate = new Date(parseInt((today.getFullYear()).toString().substring(0,2) + mpStartDateStr[2]), 
                         parseInt(mpStartDateStr[0]) - 1,
                         parseInt(mpStartDateStr[1]));
     mpEndDate = new Date(parseInt((today.getFullYear()).toString().substring(0,2) + mpEndDateStr[2]), 
                         parseInt(mpEndDateStr[0]) - 1,
                         parseInt(mpEndDateStr[1]));

     // For reference: How to remove object from HTMLCollection _AND_ DOM (will disappear from page)
     // var toRemove = tables[0].getElementsByClassName("list");
     // while(toRemove.length > 0){
     //      toRemove[0].remove();
     //      // toRemove[0].parentNode.removeChild(toRemove[0]);
     // }
     
     // Get column names for each table
     var colHeadings = [];
     for (var i = 0; i < tables.length; i++) {
          var headings = [];
          var tableHeadings = document.getElementsByClassName("listheading");     
          var tds = tableHeadings[i].getElementsByTagName("td");

          for (var j = 0; j < tds.length; j++) {
               var heading = tds[j].innerHTML;
               if (heading.includes("<")) {
                    heading = heading.split("<")[0];
                    heading = heading.split(/\s/).join("");
               }
               headings.push(heading);
          }
          colHeadings.push(headings);
     }

     // colHeadings.forEach(function(arr) {
     //      arr.forEach(function(h) {
     //           console.log(h);
     //      });
     //      console.log("----");
     // });


     // Store assignment categories
     var catRows = tables[1].getElementsByTagName("tr");
     var categories = [];
     for (var i = 0; i < catRows.length; i++) {
          // if (catRows[i].type != "listheading") {
               catCells = catRows[i].getElementsByTagName("td");
               categoryName = catCells[0].textContent.trim();
               categoryWeight = catCells[1].textContent.trim();
               // Remove " %" from categoryWeight
               categoryWeight = categoryWeight.substring(0,categoryWeight.length-2);
               categoryWeight = parseFloat(categoryWeight)/100;
               
               var catArr = [categoryName, categoryWeight];
               categories.push(catArr);
          // }
     }
     categories.splice(0,1);
     setCategories(categories);


     // Dates are "cellCenter" under List Assignments, but "cellLeft" under Course Summary
     // var dateBoxes = document.getElementsByClassName("cellCenter"); 
     var boxes = document.getElementsByClassName("cellLeft");
     var assignments = [];
     var currentAssignmentIndex = -1;
     for(var i = 0; i < boxes.length; i++) {
          // Get all table cells as box array
          var box = boxes[i]; 
          var embeddedHTML = box.innerHTML;
          var embeddedText = box.textContent.trim();

          // Start new assignment "object"
          if (embeddedText.includes("MP" + mp.toString())) {
               currentAssignmentIndex++;
               var assignmentInfo = ["Assignment Name","-----","-----","N/A"];
               assignments.push(assignmentInfo);
          }
          else if (embeddedText.includes("/")) {
               // Get all grades
               if (embeddedText.includes("%")) {
                    var grades = embeddedText.split(/\s/);
                    grades.pop();
                    assignments[currentAssignmentIndex][1] = grades.join("");
               }
               // Get all assignment dates
               else {
                    var date = embeddedText.split(/\s/).join("").substring(3); // remove day of week
                    assignments[currentAssignmentIndex][2] = date;
               }
          }
          // Get all assignment names 
          else if (embeddedHTML.includes("<b>")) {
               var bSplit = embeddedHTML.split("<b>");
               var assignmentName = "";
               bSplit.forEach(function(line) {
                    if(line.includes("</b>") && assignments[currentAssignmentIndex][0] == "Assignment Name") {
                         assignmentName = line.split("</b>")[0];
                         assignments[currentAssignmentIndex][0] = assignmentName;
                    }
               });
          }
          // Get all assignment categories
          else {
               categories.forEach(function(categ) {
                    if(embeddedText.includes(categ[0])) {
                         assignments[currentAssignmentIndex][3] = categ[0];
                    }
               });
          }
     }
     
     // assignments.forEach(function(assignment) {
     //      console.log(assignment[0] + ":\n\t" + assignment[1] + "\n\t" + assignment[2] + "\n\t" + assignment[3]);
     // });
     setAssignments(assignments);
     createAssignmentObjects();
}

function showGradeData() {
     var assignments = getAssignments();
     var body = document.getElementsByTagName('body')[0];
     var allTablesInDoc = document.getElementsByClassName('notecard');
     var mainTable = allTablesInDoc[allTablesInDoc.length - 1];

     var dataDiv = document.createElement('div');
     dataDiv.style.width = '90%';
     dataDiv.style.margin = '50px auto';
     dataDiv.setAttribute('text-align','center');
     
     var dataTbl = document.createElement('table');
     dataTbl.style.width = '100%';
     dataTbl.setAttribute('border', '2px solid gray');
     var tbdy = document.createElement('tbody');

     // Create headers
     var tr = document.createElement('tr');
     tr.style.backgroundColor = 'rgb(215,215,215)';
     var tblHeaders = ['Assignment Name','Grade','Date','Category'];
     for (var i = 0; i < 4; i++) {
          var td = document.createElement('td');
          td.style.textAlign = 'center';
          td.style.fontWeight = 'bold';
          td.appendChild(document.createTextNode(tblHeaders[i]));
          tr.appendChild(td);
     }
     tbdy.appendChild(tr);

     // Create body of table
     for (var i = 0; i < assignments.length; i++) {
          var tr = document.createElement('tr');
          for (var j = 0; j < 4; j++) {
               var td = document.createElement('td');
               j==0 ? td.style.textAlign = 'left' : td.style.textAlign = 'center';
               td.appendChild(document.createTextNode(assignments[i][j]));
               tr.appendChild(td);
          }
          tbdy.appendChild(tr);
     }
     dataTbl.appendChild(tbdy);
     dataDiv.appendChild(dataTbl);
     mainTable.appendChild(dataDiv);
}

function createAssignmentObjects() {
     assignments = getAssignments();
     assignmentObjects = [];
     year1 = mpStartDate.getFullYear();
     year2 = mpEndDate.getFullYear();
     for (var i = 0; i < assignments.length; i++) {
          // Create date object for assignment date
          var day = parseInt(assignments[i][2].substring(assignments[i][2].indexOf("/")+1));
          var month = parseInt(assignments[i][2].substring(0,assignments[i][2].indexOf("/"))) - 1;
          var year = parseInt(year1 == year2 ? year1 : (month > 7 ? year1 : year2)); 
          var assignmentDate = new Date(year,month,day);
          // Create Assignment object
          var Assignment = {
               name: assignments[i][0],
               pointsReceived: parseFloat(assignments[i][1].substring(0,assignments[i][1].indexOf("/"))),
               pointsWorth: parseFloat(assignments[i][1].substring(assignments[i][1].indexOf("/")+1)),
               date: assignmentDate,
               category: assignments[i][3]
          };
          assignmentObjects.push(Assignment);
     }
     setAssignmentObjs(assignmentObjects);
}