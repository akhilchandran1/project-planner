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
        element.scrollIntoView({behavior: 'smooth'});
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
        this.hostElement.insertAdjacentElement(this.insertBefore ? 'afterbegin' : 'beforeend', this.element);
    }
}

class Tooltip extends Component{
    constructor(closeNotifierFunction, text, hostElementId) {
        super(hostElementId);
        this.closeNotifire = closeNotifierFunction;
        this.text = text;
        this.create();
    }

    closeTooltip = () => {
        this.detach();
        this.closeNotifire();
    }

    create(){
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'card';
        const tooltipTemplate = document.getElementById('tooltip');
        const tooltipBody = document.importNode(tooltipTemplate.content, true);
        tooltipBody.querySelector('p').textContent = this.text;
        tooltipElement.append(tooltipBody);
        

        const hostElPosLeft = this.hostElement.offsetLeft;
        const hostElPosTop = this.hostElement.offsetTop;
        const hostElPosHeight = this.hostElement.clientHeight;
        const parentElementScrolling = this.hostElement.parentElement.scrollTop;

        const x = hostElPosLeft + 20;
        const y = hostElPosTop + hostElPosHeight - parentElementScrolling - 10;

        tooltipElement.style.position = 'absolute';
        tooltipElement.style.left = x + 'px';
        tooltipElement.style.top = y + 'px';

        tooltipElement.addEventListener('click', this.closeTooltip);
        this.element = tooltipElement;
    }
}

class ProjectItem {
    hasActiveTooltip = false;
    constructor (id, updateProjectListFunction, type) {
        this.id = id;
        this.updateProjectListHandler = updateProjectListFunction;
        this.connectMoreInfoButton();
        this.connectSwitchButton(type);
        this.connectDrag();
    }

    showMoreInfoHandler() {
        if(this.hasActiveTooltip) {
            return;
        }
        const projectElement = document.getElementById(this.id);
        const tooltipText = projectElement.dataset.extraInfo;
        const tooltip = new Tooltip( () => {
            this.hasActiveTooltip = false;
        }, tooltipText, this.id);
        tooltip.attach();
        this.hasActiveTooltip = true;

    }

    connectDrag(){
        document.getElementById(this.id).addEventListener("dragstart", event => {
            event.dataTransfer.setData('text/plain', this.id);
            event.dataTransfer.effectAllowed = 'move';
        })
    }

    connectMoreInfoButton(){
        const projectItemElement = document.getElementById(this.id);
        const moreInfoBtn = projectItemElement.querySelector('button:first-of-type');
        moreInfoBtn.addEventListener('click', this.showMoreInfoHandler.bind(this));

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
        const projectItems = document.querySelectorAll(`#${type}-projects li`);
        for (const projectItem of projectItems) {
            this.projects.push(new ProjectItem(projectItem.id, this.switchProject.bind(this), this.type));
        }
        console.log(this.projects);
        this.connectDroppable();
    }

    connectDroppable(){
        const list = document.querySelector(`#${this.type}-projects ul`);

        list.addEventListener('dragenter', event => {
            if(event.dataTransfer.types[0] === 'text/plain'){
                list.parentElement.classList.add('droppable');
                event.preventDefault();
            }
        });

        list.addEventListener('dragover', event => {
            if(event.dataTransfer.types[0] === 'text/plain'){
                event.preventDefault();
            }
        });

        list.addEventListener('dragleave', event => {
            if(event.relatedTarget.closest(`#${this.type}-projects ul`) !== list){
                list.parentElement.classList.remove('droppable');
            }
        });

        list.addEventListener('drop', event => {
            const projId = event.dataTransfer.getData('text/plain');
            if(this.projects.find(p => p.id === projId)){
                return;
            }
            document.getElementById(projId).querySelector('button:last-of-type').click();
        });
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
    /*    const projectIndex = this.projects.findIndex(project => project.id === projectId);
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