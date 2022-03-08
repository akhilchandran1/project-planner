class DOMHelper {
    static clearEventListeners(element) {
        const clonedElement = element.cloneNode(true);
        element.replaceWith(clonedElement);
        return clonedElement;
    }

    static moveElement(elementId, newDestinationSelector) {
        const element = document.getElementById(elementId);
        const destinationElement = document.querySelector(newDestinationSelector);
        destinationElement.append(element);
    }
}

class Component {
    constructor(hostElementId, insertBefore = false){
        if(hostElementId) {
            this.hostElement = document.getElementById(hostElementId);
        } else {
            this.histElement = document.body;
        }
        this.insertBefore = insertBefore;
    }

    detach() {
        if(this.element) {
            this.element.remove(); //modern code
            // to support older version
            // this.element.parentElement.removeChild(this.element);
        }

    }
    attach() {
        this.histElement.insertAdjacentElement(this.insertBefore ? 'afterbegin' : 'beforeend', this.element)
    }
}

class Tooltip extends Component{
    constructor(closeNotifierFunction) {
        super();
        this.closeNotifire = closeNotifierFunction;
        this.create();
    }

    closeTooltip = () => {
        this.detach();
        this.closeNotifire();
    }

    create(){
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';
        tooltipElement.textContent = 'Dummy';
        tooltipElement.addEventListener('click', this.detach);
        this.element = tooltipElement;
    }
}

class ProjectItem {
    hasActiveTooltip = false;
    constructor (id, updateProjectListFunction, type) {
        this.id = id;
        this.updateProjectListHandler = updateProjectListFunction;
        this.connectMoreInfo();
        this.connectSwitchButton(type);
    }

    showMoreInfoHandler() {
        if(this.hasActiveTooltip) {
            return;
        }
        const tooltip = new Tooltip( () => {
            this.hasActiveTooltip = false;
        });
        tooltip.attach();
        this.hasActiveTooltip = true;

    }

    connectMoreInfo(){
        const projectItemElement = document.getElementById(this.id);
        const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click', this.showMoreInfoHandler);

    }

    connectSwitchButton(type) {
        const projectItemElement = document.getElementById(this.id);
        let switchBtn = projectItemElement.querySelector('button:last-of-type');
        switchBtn =  DOMHelper.clearEventListeners(switchBtn);
        switchBtn.textContent = type === 'active' ? 'Finish' : 'Activate';
        switchBtn.addEventListener('click', this.updateProjectListHandler.bind(null, this.id));
    }
    update(updateProjectListsFun, type) {
        this.updateProjectListHandler = updateProjectListsFun;
        this.connectSwitchButton(type);
    }
}

class ProjectList {
    projects = [];

    constructor(type) {
        this.type = type;
        const projectItems = document.querySelectorAll(`#${this.type}-projects li`);
        for (const projectItem of projectItems) {
            this.projects.push(new ProjectItem(projectItem.id, this.switchProject.bind(this), this.type));
        }
        console.log(this.projects);
    }

    setSwitchHandlerFunction(switchHandlerFunction) {
        this.switchHandler = switchHandlerFunction;
    }

    addProject(project) {
        this.projects.push(project);
        DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this), this.type);
    }

    switchProject(projectId) {
/*         const projectIndex = this.projects.findIndex(project => project.id === projectId);
        this.projects.splice(projectIndex, 1); */
        this.switchHandler(this.projects.find(project => project.id === projectId));
        this.projects = this.projects.filter(project => project.id !== projectId);
    }
}

class App {
    static init(){
        const activeProjectList = new ProjectList ('active');
        const finishedProjectList = new ProjectList ('finished');
        activeProjectList.setSwitchHandlerFunction(finishedProjectList.addProject.bind(finishedProjectList));
        finishedProjectList.setSwitchHandlerFunction(activeProjectList.addProject.bind(activeProjectList));
    }
}

App.init();