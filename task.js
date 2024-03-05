function addTask() {
    const taskInput = document.getElementById('task-input');
    const task = taskInput.value.trim();

    if (task !== '') {
        const taskList = document.getElementById('task-list');
        const newTask = document.createElement('div');
        newTask.classList.add('task');

        const importantKeywords = ['important', 'critical', 'urgent', 'deadline']; //could add on this with AI to determine it 
        const somewhatImportantKeywords = ['meeting', 'presentation', 'appointment', 'review'];
        
        let urgencyColor = '';
        if (containsAny(task, importantKeywords)) {
            urgencyColor = '255 127 127';
        } else if (containsAny(task, somewhatImportantKeywords)) {
            urgencyColor = '255, 211, 1'; 
        } else {
            urgencyColor = '123, 182, 98'; 
        }

        newTask.style.backgroundColor = `rgb(${urgencyColor})`;

        newTask.innerHTML = `<span>${task}</span>
                             <span class="priority-color" style="background-color:rgb(${urgencyColor});"></span>
                             <div class="task-buttons">
                                 <button class="complete-task" onclick="completeTask(this)"><i class="fas fa-check"></i></button>
                             </div>`;
        taskList.appendChild(newTask);

        taskInput.value = '';
    }
}



function completeTask(taskElement) {
    taskElement.parentElement.parentElement.remove();
}

function containsAny(str, keywords) {
    const lowerCaseStr = str.toLowerCase();
    return keywords.some(keyword => lowerCaseStr.includes(keyword.toLowerCase()));
}
