import React, { useState, useContext, useEffect } from "react";
import "antd/dist/reset.css";
import "./calendar.css";
import {
  Calendar,
  Card,
  List,
  Modal,
  Button,
  theme,
  message,
  Input,
} from "antd";
import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import moment from "moment";
import dayjs from "dayjs";
import AddTask from "../components/AddTask";
import { UserContext } from "../context/UserContext";

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
        {isCardView && hasTask && <span className="task-dot" />}
      </div>
      <ul className="event-list">
        {events.map((event, idx) => (
          <EventCell key={event.id} event={event} eventIdx={idx} />
        ))}
      </ul>
      {!isCardView && hasTask && (
        <div className="notice">📢 {notices[0].title}</div>
      )}
    </div>
  );
};

const CalendarComponent = ({ setBreadcrumbExtra }) => {
  const { user } = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [data, setData] = useState({});
  const [notices, setNotices] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCardView, setIsCardView] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [notes, setNotes] = useState("");
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  const { token } = theme.useToken();

  const calendarCardStyle = {
    width: 300,
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    padding: "10px",
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

  // ✅ FETCH all tasks on mount
  useEffect(() => {
    const fetchAllTasks = async () => {
      if (!user || !user.token) return;

      try {
        const res = await fetch("http://localhost:5000/api/tasks", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch tasks");

        const allTasks = await res.json();

        const groupedByDate = allTasks.reduce((acc, task) => {
          const taskDate = dayjs(task.due_date).format("YYYY-MM-DD");
          if (!acc[taskDate]) acc[taskDate] = [];
          acc[taskDate].push(task);
          return acc;
        }, {});

        setNotices(groupedByDate);
      } catch (error) {
        console.error("Error fetching all tasks:", error);
      }
    };

    fetchAllTasks();
  }, [user]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleDateSelect = async (date) => {
    const selectedDay = date.format("YYYY-MM-DD");
    setSelectedDate(selectedDay);
    setIsCardView(true);
    setBreadcrumbExtra?.("Tasks");

    try {
      // 🟢 Fetch only user's tasks for this selected date from backend
      const res = await fetch(
        `http://localhost:5000/api/tasks?date=${selectedDay}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch tasks for selected date");

      const selectedTasks = await res.json();

      setNotices((prev) => ({
        ...prev,
        [selectedDay]: selectedTasks,
      }));

      // 🔁 Fetch upcoming tasks
      const upcomingRes = await fetch("http://localhost:5000/api/tasks", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const upcomingData = await upcomingRes.json();
      setUpcomingTasks(Array.isArray(upcomingData) ? upcomingData : []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    }
  };

  const handleCancelView = () => {
    setIsCardView(false);
    setSelectedTask(null);
    setSelectedDate(null);
    setBreadcrumbExtra?.(null);
  };

  const handleTaskAdd = async (newTask) => {
    const taskDay = dayjs(newTask.due_date).format("YYYY-MM-DD");

    setNotices((prev) => {
      const updated = { ...prev };
      if (!updated[taskDay]) updated[taskDay] = [];
      updated[taskDay].push(newTask);
      return updated;
    });

    message.success("Task added!");
    setShowAddTask(false);
  };

  return (
    <Ctx.Provider value={{ setShow, setSelectedEvent, moveEvent }}>
      <DndProvider backend={HTML5Backend}>
        <div
          className="main-container"
          style={{ display: "flex", height: "100vh" }}
        >
          {/* Calendar */}
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
                    const day = date.format("YYYY-MM-DD");
                    const hasTask = notices[day] && notices[day].length > 0;
                    return (
                      <div className="calendar-card-date">
                        <span>{date.format("D")}</span>
                        {hasTask && <span className="task-dot" />}
                      </div>
                    );
                  }}
                />
              </div>
            ) : (
              <Calendar
                fullCellRender={(date) => (
                  <CalendarCell
                    date={date}
                    events={data[date.format("D")] || []}
                    notices={notices[date.format("YYYY-MM-DD")] || []}
                    isCardView={false}
                  />
                )}
                onSelect={handleDateSelect}
              />
            )}
          </div>

          {/* Task Section */}
          {isCardView && (
            <div
              className="task-section"
              style={{ flex: 1, padding: "20px", position: "relative" }}
            >
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={handleCancelView}
                style={{ position: "absolute", top: 0, right: 0 }}
              />
              <h3>Tasks for {selectedDate}</h3>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddTask(true)}
                style={{ marginBottom: "20px" }}
              >
                Add Task
              </Button>

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

              <div style={{ marginTop: "30px" }}>
                <h4>Upcoming Tasks</h4>
                <List
                  bordered
                  dataSource={upcomingTasks}
                  renderItem={(task) => (
                    <List.Item key={task.id} style={{ cursor: "pointer" }}>
                      ⏳ {task.title} - {moment(task.due_date).format("MMM D")}
                    </List.Item>
                  )}
                />
              </div>

              <div style={{ marginTop: "20px" }}>
                <h4>Notes</h4>
                <Input.TextArea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Write your notes here..."
                  rows={4}
                />
              </div>

              {selectedTask && (
                <Card style={{ marginTop: "20px", padding: "15px" }}>
                  <h4>{selectedTask.title}</h4>
                  <p>Date: {selectedDate}</p>
                  <p>Details about the task...</p>
                </Card>
              )}
            </div>
          )}
        </div>

        {isCardView && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddTask(true)}
            style={{
              position: "fixed",
              bottom: 20,
              right: 20,
              width: 56,
              height: 56,
              borderRadius: "50%",
              padding: 0,
              fontSize: 24,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            }}
          />
        )}

        <Modal
          open={show}
          onOk={() => setShow(false)}
          onCancel={() => setShow(false)}
        >
          <h3>Event Details</h3>
          <p>{selectedEvent?.title}</p>
        </Modal>

        <Modal
          open={showAddTask}
          footer={null}
          onCancel={() => setShowAddTask(false)}
        >
          <AddTask onTaskAdd={handleTaskAdd} />
        </Modal>
      </DndProvider>
    </Ctx.Provider>
  );
};

export default CalendarComponent;
