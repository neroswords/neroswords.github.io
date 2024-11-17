// script.js

const sliderContainer = document.querySelector('.slider-container');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentSlide = 0;
const totalSlides = document.querySelectorAll('.slide').length;

function showSlide(index) {
  sliderContainer.style.transform = `translateX(-${index * 100}vw)`;
  currentSlide = index;
}

// Event listeners for arrow buttons
leftArrow.addEventListener('click', () => {
  if (currentSlide > 0) {
    currentSlide--;
    showSlide(currentSlide);
  }
});

rightArrow.addEventListener('click', () => {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    showSlide(currentSlide);
  }
});

async function fetchEvents(month, year) {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    mode: "cors"
  };
  let apiUrl = `https://z8rik9fkaj.execute-api.ap-southeast-1.amazonaws.com/Prod/events/?month=${month}&year=${year}`;

  try {
    const response = await fetch(apiUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const events = await response.json();

    return events.map(event => ({
      ...event,
      startDate: moment(event.startDate),
      endDate: moment(event.endDate)
    }));
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
}

!function () {
  var today = moment();

  function Calendar(selector, events) {
    this.el = document.querySelector(selector);
    this.events = events;
    this.current = moment().date(1);
    this.draw();
    var current = document.querySelector('.today');
    if (current) {
      var self = this;
      window.setTimeout(function () {
        self.openDay(current);
      }, 500);
    }
  }

  Calendar.prototype.draw = function () {
    if (!this.header) {
      this.drawHeader();
    }
    if (this.month) {
      this.month.remove();
    }
    this.drawMonth();
    this.drawLegend();
  };

  Calendar.prototype.drawHeader = function () {
    var self = this;
    this.header = createElement('div', 'header');
    this.title = createElement('h1');

    var right = createElement('div', 'right');
    right.addEventListener('click', async function () {
      await self.nextMonth();
    });

    var left = createElement('div', 'left');
    left.addEventListener('click', async function () {
      await self.prevMonth();
    });

    this.header.appendChild(this.title);
    this.header.appendChild(right);
    this.header.appendChild(left);
    this.el.appendChild(this.header);

    this.title.innerHTML = this.current.format('MMMM YYYY');
  };

  Calendar.prototype.drawMonth = function () {
    this.title.innerHTML = this.current.format('MMMM YYYY');
    this.month = createElement('div', 'month');
    this.el.appendChild(this.month);
    this.backFill();
    this.currentMonth();
    this.fowardFill();
    this.month.className = 'month new';
  };

  Calendar.prototype.backFill = function () {
    var clone = this.current.clone();
    var dayOfWeek = clone.day();

    if (!dayOfWeek) return;

    clone.subtract('days', dayOfWeek + 1);
    for (var i = dayOfWeek; i > 0; i--) {
      this.drawDay(clone.add(1, 'days'));
    }
  };

  Calendar.prototype.fowardFill = function () {
    var clone = this.current.clone().add('months', 1).subtract(1, 'days');
    var dayOfWeek = clone.day();

    if (dayOfWeek === 6) return;

    for (var i = dayOfWeek; i < 6; i++) {
      this.drawDay(clone.add(1, 'days'));
    }
  };

  Calendar.prototype.currentMonth = function () {
    var clone = this.current.clone();

    while (clone.month() === this.current.month()) {
      this.drawDay(clone);
      clone.add(1, 'days');
    }
  };

  Calendar.prototype.getWeek = function (day) {
    if (!this.week || day.day() === 0) {
      this.week = createElement('div', 'week');
      this.month.appendChild(this.week);
    }
  };

  Calendar.prototype.drawDay = function (day) {
    const self = this;
    this.getWeek(day);
    var cloneDay = day.clone();

    //Outer Day element for the calendar
    const outer = createElement('div', this.getDayClass(day));
    console.log(cloneDay.format('YYYY-MM-DD'));
    
    // Pass both the element and day to openDay function when clicked
    outer.addEventListener('click', function () {
        console.log("Clicked day:", cloneDay ? cloneDay.format('YYYY-MM-DD') : "day is undefined"); // Debugging statement
        self.openDay(outer, cloneDay); // Explicitly passing day to openDay
    });

    // Day Name and Number
    const name = createElement('div', 'day-name', day.format('ddd'));
    const number = createElement('div', 'day-number', day.format('DD'));

    // Events container
    const events = createElement('div', 'day-events');
    this.drawEvents(day, events);

    // Append day information to the outer container
    outer.appendChild(name);
    outer.appendChild(number);
    outer.appendChild(events);
    this.week.appendChild(outer);
};

  Calendar.prototype.drawEvents = function (day, element) {
    var todaysEvents = this.events.filter(ev => ev.startDate.isSame(day, 'day'));

    todaysEvents.forEach(function (ev) {
      var evSpan = createElement('span', ev.color);
      element.appendChild(evSpan);
    });
  };

  Calendar.prototype.getDayClass = function (day) {
    var classes = ['day'];
    if (day.month() !== this.current.month()) {
      classes.push('other');
    } else if (today.isSame(day, 'day')) {
      classes.push('today');
    }
    return classes.join(' ');
  };

  Calendar.prototype.openDay = function (el, day) {
    console.log(day);
    // Check that day is defined
    if (!day) {
        console.error("Error: 'day' is undefined in openDay");
        return;
    }

    let details, arrow;
    const selectedDay = day.clone(); // Use day directly as the selected day

    // Remove any currently opened details box
    const currentOpened = document.querySelector('.details');
    if (currentOpened && currentOpened.parentNode === el.parentNode) {
        details = currentOpened;
        arrow = document.querySelector('.calendar-arrow');
    } else {
        if (currentOpened) {
            currentOpened.className = 'details out';
            currentOpened.addEventListener('animationend', function () {
                currentOpened.remove();
            });
        }

        // Create new details container
        details = createElement('div', 'details in');
        arrow = createElement('div', 'calendar-arrow');
        details.appendChild(arrow);
        el.parentNode.appendChild(details);
    }

    // Debugging: Log selected day and available events
    console.log(`Selected day: ${selectedDay.format('YYYY-MM-DD')}`);
    console.log(`Total events: ${this.events.length}`);

    // Find events for the selected day
    const todaysEvents = this.events.filter(ev => ev.startDate.isSame(selectedDay, 'day'));

    // Debugging: Log events for the selected day
    console.log(`Events for ${selectedDay.format('YYYY-MM-DD')}:`, todaysEvents);

    // Render the events in the details view
    this.renderEvents(todaysEvents, details);

    // Position the arrow
    arrow.style.left = el.offsetLeft - el.parentNode.offsetLeft + 27 + 'px';
};



  Calendar.prototype.renderEvents = function (events, ele) {
    var currentWrapper = ele.querySelector('.events');
    var wrapper = createElement('div', 'events in' + (currentWrapper ? ' new' : ''));

    events.forEach(function (ev) {
      var div = createElement('div', 'event');
      var square = createElement('div', 'event-category ' + ev.color);
      if (ev.endDate.format('HH:mm') == '23:59' && ev.startDate.format('HH:mm') == '00:00'){
        var span = createElement('span', 'text-ellipsis', 'All Day - ' + ev.eventName);
      } else {
        var end = ev.endDate.format('HH:mm') == '23:59' ? '' : ' - ' + ev.endDate.format('HH:mm');
        var span = createElement('span', 'text-ellipsis', ev.startDate.format('HH:mm') + end + ' ' + ev.eventName);
      }
      div.appendChild(square);
      div.appendChild(span);
      wrapper.appendChild(div);
    });

    if (!events.length) {
      var div = createElement('div', 'event empty');
      var span = createElement('span', '', 'No Events');
      div.appendChild(span);
      wrapper.appendChild(div);
    }

    if (currentWrapper) {
      currentWrapper.className = 'events out';
      currentWrapper.addEventListener('animationend', function () {
        currentWrapper.remove();
        ele.appendChild(wrapper);
      });
    } else {
      ele.appendChild(wrapper);
    }
  };

  Calendar.prototype.nextMonth = async function () {
    this.current.add(1, 'months');
    this.events = await fetchEvents(this.current.month() + 1, this.current.year());
    this.draw();
  };

  Calendar.prototype.prevMonth = async function () {
    this.current.subtract(1, 'months');
    this.events = await fetchEvents(this.current.month() + 1, this.current.year());
    this.draw();
  };

  Calendar.prototype.drawLegend = function () {
    var legend = createElement('div', 'legend');
    var calendars = this.events.map(function (e) {
      return e.calendar + '|' + e.color;
    }).reduce(function (memo, e) {
      if (memo.indexOf(e) === -1) {
        memo.push(e);
      }
      return memo;
    }, []).forEach(function (e) {
      var parts = e.split('|');
      var entry = createElement('span', 'entry ' + parts[1], parts[0]);
      legend.appendChild(entry);
    });
    this.el.appendChild(legend);
  };

  window.Calendar = Calendar;

  function createElement(tagName, className, innerText) {
    var ele = document.createElement(tagName);
    if (className) ele.className = className;
    if (innerText) ele.textContent = innerText;
    return ele;
  }
}();

(async function () {
  const currentMonth = moment().month() + 1;
  const currentYear = moment().year();
  const data = await fetchEvents(currentMonth, currentYear);

  new Calendar('#calendar', data);
})();
