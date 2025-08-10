document.addEventListener('DOMContentLoaded', function () {
    let savedEvents = JSON.parse(localStorage.getItem('agendaEventos')) || [];
    let editingEvent = null;
    let selectedEvent = null;

    const calendarEl = document.getElementById('calendar');
    const modal = document.getElementById('eventModal');
    const actionModal = document.getElementById('actionModal');

    const modalTitle = document.getElementById('modalTitle');
    const eventTitle = document.getElementById('eventTitle');
    const allDayCheckbox = document.getElementById('allDayCheckbox');
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const timeInputs = document.getElementById('timeInputs');

    const saveEventBtn = document.getElementById('saveEvent');
    const cancelEventBtn = document.getElementById('cancelEvent');
    const editEventBtn = document.getElementById('editEvent');
    const deleteEventBtn = document.getElementById('deleteEvent');
    const closeActionModalBtn = document.getElementById('closeActionModal');

    const colores = ['fc-event-pastel1', 'fc-event-pastel2', 'fc-event-pastel3'];

    let calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        selectable: true,
        events: savedEvents,

        dateClick: function (info) {
            editingEvent = null;
            modalTitle.textContent = "Nuevo evento";
            eventTitle.value = "";
            startDate.value = info.dateStr;
            endDate.value = info.dateStr;
            startTime.value = "";
            endTime.value = "";
            allDayCheckbox.checked = true;
            timeInputs.style.display = "none";
            modal.style.display = "flex";
        },

        eventClick: function (info) {
            selectedEvent = info.event;
            actionModal.style.display = "flex";
        }
    });

    // Mostrar/ocultar inputs de hora
    allDayCheckbox.addEventListener('change', () => {
        timeInputs.style.display = allDayCheckbox.checked ? "none" : "block";
    });

    // Guardar evento
    saveEventBtn.addEventListener('click', () => {
        if (!eventTitle.value.trim()) {
            alert("El título es obligatorio");
            return;
        }

        const nuevoEvento = {
            id: editingEvent ? editingEvent.id : String(Date.now()),
            title: eventTitle.value,
            start: allDayCheckbox.checked ? startDate.value : `${startDate.value}T${startTime.value}`,
            end: allDayCheckbox.checked ? endDate.value : `${endDate.value}T${endTime.value}`,
            allDay: allDayCheckbox.checked,
            className: editingEvent ? editingEvent.classNames : [colores[Math.floor(Math.random() * colores.length)]]
        };

        if (editingEvent) {
            editingEvent.remove();
            savedEvents = savedEvents.filter(ev => ev.id !== nuevoEvento.id);
        }

        calendar.addEvent(nuevoEvento);
        savedEvents.push(nuevoEvento);
        localStorage.setItem('agendaEventos', JSON.stringify(savedEvents));

        modal.style.display = "none";
    });

    // Cancelar modal de creación/edición
    cancelEventBtn.addEventListener('click', () => {
        modal.style.display = "none";
    });

    // Botón editar en el modal de acciones
    editEventBtn.addEventListener('click', () => {
        if (!selectedEvent) return;
        editingEvent = selectedEvent;

        modalTitle.textContent = "Editar evento";
        eventTitle.value = selectedEvent.title;
        startDate.value = selectedEvent.startStr.slice(0, 10);
        endDate.value = selectedEvent.end ? selectedEvent.endStr.slice(0, 10) : selectedEvent.startStr.slice(0, 10);

        if (selectedEvent.allDay) {
            allDayCheckbox.checked = true;
            timeInputs.style.display = "none";
        } else {
            allDayCheckbox.checked = false;
            timeInputs.style.display = "block";
            startTime.value = selectedEvent.start.toISOString().slice(11, 16);
            if (selectedEvent.end) {
                endTime.value = selectedEvent.end.toISOString().slice(11, 16);
            }
        }

        actionModal.style.display = "none";
        modal.style.display = "flex";
    });

    // Botón eliminar en el modal de acciones
    deleteEventBtn.addEventListener('click', () => {
        if (!selectedEvent) return;
        if (confirm("¿Seguro que quieres eliminar este evento?")) {
            selectedEvent.remove();
            savedEvents = savedEvents.filter(ev => ev.id !== selectedEvent.id);
            localStorage.setItem('agendaEventos', JSON.stringify(savedEvents));
        }
        actionModal.style.display = "none";
    });

    // Cerrar modal de acciones
    closeActionModalBtn.addEventListener('click', () => {
        actionModal.style.display = "none";
    });

    // Cerrar modales clicando fuera
    window.onclick = function (event) {
        if (event.target === modal) modal.style.display = "none";
        if (event.target === actionModal) actionModal.style.display = "none";
    };

    calendar.render();
});
