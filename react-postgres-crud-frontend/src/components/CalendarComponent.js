import React, { useState, useContext } from "react";
import "antd/dist/reset.css";
import "./calendar.css";
import { Calendar, Card, List, Modal, Button, theme } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";

const Ctx = React.createContext(null);

const EventCell = ({ event, eventIdx }) => {
  const [, drag] = useDrag({
    type: "event",
    item: { event, eventIdx },
  });

  const { setShow, setSelectedEvent } = useContext(Ctx);

  return (
    <li
      ref={drag}
      className="event-item"
      onClick={() => {
        setSelectedEvent(event);
        setShow(true);
      }}
    >
      {event.title}
    </li>
  );
};

const CalendarCell = ({ date, events, notices, isCardView }) => {
  const { moveEvent } = useContext(Ctx);
  const [, drop] = useDrop({
    accept: "event",
    drop: (item) => moveEvent(item.eventIdx, date.format("D")),
  });

  const isToday = date.isSame(moment(), "day");
  const hasTask = notices.length > 0;

  return (
    <div ref={drop} className={`calendar-cell ${isToday ? "today-cell" : ""}`}>
      <div className="date-label">
        {date.format("D")}
        {/* Show red dot in card view, but not in full view */}
        {isCardView && hasTask && <span className="task-dot" />}
      </div>
      <ul className="event-list">
        {events.map((event, idx) => (
          <EventCell key={event.id} event={event} eventIdx={idx} />
        ))}
      </ul>
      {/* Show task title only in full view */}
      {!isCardView && hasTask && (
        <div className="notice">📢 {notices[0].title}</div>
      )}
    </div>
  );
};

const CalendarComponent = () => {
  const [show, setShow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [data, setData] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCardView, setIsCardView] = useState(false);

  const { token } = theme.useToken();

  const calendarCardStyle = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: "10px",
  };

  const notices = {
    4: [{ id: 1, title: "Project Deadline" }],
    10: [{ id: 2, title: "Team Meeting" }],
    20: [{ id: 3, title: "Holiday" }],
  };

  const moveEvent = (oldIdx, newD) => {
    setData((prev) => {
      const newData = { ...prev };
      if (!newData[newD]) newData[newD] = [];
      newData[newD].push(newData[oldIdx]);
      delete newData[oldIdx];
      return newData;
    });
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.format("D"));
    setIsCardView(true);
  };

  const handleCancelView = () => {
    setIsCardView(false);
    setSelectedTask(null);
    setSelectedDate(null);
  };

  return (
    <Ctx.Provider value={{ setShow, setSelectedEvent, moveEvent }}>
      <DndProvider backend={HTML5Backend}>
        <div
          className="main-container"
          style={{ display: "flex", height: "100vh" }}
        >
          {/* Left Side: Fullscreen calendar or Card View */}
          <div
            style={{
              width: isCardView ? "30%" : "100%",
              transition: "width 0.3s ease-in-out",
            }}
          >
            {isCardView ? (
              <div style={calendarCardStyle}>
                <Calendar
                  fullscreen={false}
                  onSelect={handleDateSelect}
                  dateFullCellRender={(date) => {
                    const day = date.format("D");
                    const hasTask = notices[day] && notices[day].length > 0;

                    return (
                      <div className="calendar-card-date">
                        <span>{date.format("D")}</span>
                        {/* Show red dot in card view */}
                        {hasTask && <span className="task-dot" />}
                      </div>
                    );
                  }}
                />
              </div>
            ) : (
              <Calendar
                fullCellRender={(
                  date // ✅ Replaced `dateFullCellRender` with `fullCellRender`
                ) => (
                  <CalendarCell
                    date={date}
                    events={data[date.format("D")] || []}
                    notices={notices[date.format("D")] || []}
                    isCardView={false} // Fullscreen mode, show task text
                  />
                )}
                onSelect={handleDateSelect}
              />
            )}
          </div>

          {/* Right Side: Task Section */}
          {isCardView && (
            <div
              className="task-section"
              style={{ flex: 1, padding: "20px", position: "relative" }}
            >
              {/* Close Button */}
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleCancelView}
                style={{ position: "absolute", top: 0, right: 0 }}
              />

              <h3>Tasks for {selectedDate}</h3>
              <List
                bordered
                dataSource={notices[selectedDate] || []}
                renderItem={(task) => (
                  <List.Item
                    onClick={() => handleTaskClick(task)}
                    style={{ cursor: "pointer" }}
                  >
                    📌 {task.title}
                  </List.Item>
                )}
              />

              {/* Task Details */}
              {selectedTask && (
                <Card
                  className="task-details-card"
                  style={{ marginTop: "20px", padding: "15px" }}
                >
                  <h4>{selectedTask.title}</h4>
                  <p>Date: {selectedDate}</p>
                  <p>Details about the task...</p>
                </Card>
              )}
            </div>
          )}
        </div>

        <Modal
          open={show}
          onOk={() => setShow(false)}
          onCancel={() => setShow(false)}
        >
          <h3>Event Details</h3>
          <p>{selectedEvent?.title}</p>
        </Modal>
      </DndProvider>
    </Ctx.Provider>
  );
};

export default CalendarComponent;
