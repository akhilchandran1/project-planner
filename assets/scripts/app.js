class ToolTip {

}

class ProjectItem {
    constructor (id) {
        this.id = id;
        this.connectMoreInfo();
        this.connectSwitchButton();
    }

    connectMoreInfo(){}

    connectSwitchButton() {
        const projectItemElement = document.getElementById(this.id);
        const switchBtn = projectItemElement.querySelector('button:last-of-type');
        switchBtn.addEventListener('click', );
    }
}

class ProjectList {
    projects = [];

    constructor(type) {
        const projectItems = document.querySelectorAll(`#${type}-projects li`);
        for (const projectItem of projectItems) {
            this.projects.push(new ProjectItem(projectItem.id));
        }
        console.log(this.projects);
    }
    addProject() {

    }

    swtchProject(projectId) {

    }
}

class App {
    static init(){
        const activeProjectList = new ProjectList ('active');
        const finishedProjectList = new ProjectList ('finished');
    }
}

App.init();