let empPayrollList;
window.addEventListener('DOMContentLoaded',(event)=>{ 
    if(site_properties.use_local_storage.match("true")) {
        getEmployeePayrollDataFromStorage();
    } else getEmployeePayrollDataFromServer();
});

const processEmployeePayrollDataResponse = () => {
    document.querySelector(".emp-count").textContent = empPayrollList.length;
    createInnerHTML();
    localStorage.removeItem('editEmp');
}

const getEmployeePayrollDataFromStorage = () => {
    return localStorage.getItem("EmployeePayrollList") ?
        JSON.parse(localStorage.getItem("EmployeePayrollList")) :
        [];
}

const getEmployeePayrollDataFromServer = () => {
    makeServiceCall("GET", site_properties.server_url, true)
        .then(responseText => {
            empPayrollList = JSON.parse(responseText);
            processEmployeePayrollDataResponse();
        })
        .catch(error => {
            console.log("GET Error Status: " + JSON.stringify(error));
            empPayrollList = [];
            processEmployeePayrollDataResponse();
        });
}

function createInnerHTML(){
    if(empPayrollList.length == 0) return;
    const headerHTML=
        "<th></th>"+
        "<th>Emp Name</th>"+
        "<th>Gender</th>"+
        "<th>Department</th>"+
        "<th>Salary</th>"+
        "<th>Start Date</th>"+
        "<th>Actions</th>";
    
    let innerHTML = `${headerHTML}`;    
    for(const empData of empPayrollList) {
        innerHTML = `${innerHTML}
        <tr>
            <td><img class="profile" src="${empData._profilePic}" alt="Profile Pic"></td>
            <td>${empData._name}</td>
            <td>${empData._gender}</td>
            <td>${getDeptHTML(empData._department)}</td>
            <td>RS ${empData._salary}</td>
            <td>${stringifyDate(empData._startDate)}</td>
            <td>
                <img id="${empData.id}" onclick="remove(this)" alt="delete" src="../assets/icons/delete-black-18dp.svg">
                <img id="${empData.id}" onclick="update(this)" alt="edit" src="../assets/icons/create-black-18dp.svg">
            </td>
        </tr>
        `;
    }
    document.querySelector('#table-display').innerHTML = innerHTML;
}

function getDeptHTML(deptList) {
    let deptHTML = '';
    for(const dept of deptList) {
        deptHTML = `${deptHTML}
        <div class="dept-label">${dept}</div>`;
    }
    return deptHTML;
}

const update = (node) => {
    let empPayrollData = empPayrollList.find(empData => empData.id == node.id);
    if(!empPayrollData) return;
    localStorage.setItem('editEmp', JSON.stringify(empPayrollData));
    window.location.replace(site_properties.add_emp_payroll_page);
}

const remove = (node) => {
    let empPayrollData = empPayrollList.find(empData => empData.id == node.id);
    if(!empPayrollData) { alert("Not deleted"); return;}
    const index = empPayrollList
                    .map(empData => empData.id)
                    .indexOf(empPayrollData.id);
    empPayrollList.splice(index, 1);
    if(site_properties.use_local_storage.match("true")) {
        localStorage.setItem("EmployeePayrollList", JSON.stringify(empPayrollList));
        createInnerHTML();
    } else {
        const deleteURL = site_properties.server_url + "/" + empPayrollData.id.toString();
        makeServiceCall("DELETE", deleteURL, false)
            .then(responseText => {
                createInnerHTML();
            })
            .catch(error => {
                console.log("DELETE Error Status: " + JSON.stringify(error));
            });
    }
    
    alert("Deleted");
}

