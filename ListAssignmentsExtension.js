removeUnnecessaryHeaders();
extractGradeData();


function removeUnnecessaryHeaders() {
     //Removes unnecessary columns
     var headers = document.getElementsByClassName("headerCategoryTab");
     var headersToDelete = ["Attendance", "Grading", "Scheduling", "Documents", "Course Pages"]
     for(var i = headers.length-1; i>-1; i--) {
         var selectedEl = headers[i];
         var embeddedText = selectedEl.textContent.trim();
         if (headersToDelete.includes(embeddedText)) {
             selectedEl.parentNode.removeChild(selectedEl);
         }
     }

     //Removes student switcher
     var studentHeader = document.getElementsByClassName("headerStudentSelector")[0];
     studentHeader.parentNode.removeChild(studentHeader);
 
     //Removes the top bar since logout/settings is pointless
     var topHeader = document.getElementsByClassName("headerModules")[0];
     topHeader.parentNode.removeChild(topHeader);
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
               var assignmentInfo = ["Name","Grade","Date"];
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
     
}
