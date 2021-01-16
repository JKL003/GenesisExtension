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

var assignmentList = [];

function getAssignments() {
     return assignmentList;
}
function setAssignments(newAssignments) {
     assignmentList = newAssignments;
}

function extractGradeData() {
     var mp = 2;
     var dateBoxes = document.getElementsByClassName("cellCenter");
     var boxes = document.getElementsByClassName("cellLeft");
     var assignments = [];
     var currentAssignmentIndex = -2;
     for(var i = 0; i < boxes.length; i++) {
          // Get all table cells as box array
          var box = boxes[i]; 
          var embeddedHTML = box.innerHTML;
          var embeddedText = box.textContent.trim();

          // Start new assignment "object"
          if (embeddedText.includes("MP" + mp.toString())) {
               currentAssignmentIndex++;
               var assignmentInfo = ["Assignment Name","-----","-----"];
               assignments.push(assignmentInfo);
          }
          // Get all grades
          else if (embeddedText.includes("%")) {
               var grades = embeddedText.split(/\s/);
               grades.pop();
               assignments[currentAssignmentIndex][1] = grades.join("");
          }
          // Get all assignment names 
          else if (embeddedHTML.includes("<b>")) {
               var bSplit = embeddedHTML.split("<b>");
               var assignmentName = "";
               bSplit.forEach(function(line) {
                    if(line.includes("</b>")) {
                         assignmentName = line.split("</b>")[0];
                         assignments[currentAssignmentIndex][0] = assignmentName;
                    }
               });
          }
     }
     assignments.pop();

     var dateBoxIndex = 0;
     // Add corresponding date to each assignment "object" (in array)
     for (var i = 0; i < dateBoxes.length; i++) {
          var dbox = dateBoxes[i]; 
          var embeddedHTML = dbox.innerHTML;
          var embeddedText = dbox.textContent.trim();

          if (embeddedText.includes("/")) {
               var date = embeddedText.split(/\s/).join("").substring(3);
               assignments[dateBoxIndex][2] = date;
               dateBoxIndex++;
          }
     }
     
     assignments.forEach(function(assignment) {
          console.log(assignment[0] + ":\n\t" + assignment[1] + "\n\t" + assignment[2]);
     });
     setAssignments(assignments);
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
     var tblHeaders = ['Assignment Name','Grade','Date'];
     for (var i = 0; i < 3; i++) {
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
          for (var j = 0; j < 3; j++) {
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
