import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import Skeleton from "react-loading-skeleton"
import { Radio, RadioGroup, FormControl, FormControlLabel } from "@mui/material"
import debounce from "lodash.debounce"
import "react-loading-skeleton/dist/skeleton.css"

import "./Tasks.styles.css"
import {
   getTasks,
   deleteTask,
   editTaskStatus,
} from "../../../store/actions/tasksActions"
import { useResize } from "../../../hooks/useResize"
import { Header } from "../../Header/Header"
import { TaskForm } from "../../TaskForm/TaskForm"
import { Card } from "../../Card/Card"

export const Tasks = () => {
   const [list, setList] = useState(null)
   const [renderList, setRenderList] = useState(null)
   const [tasksfromWho, setTasksfromWho] = useState("ALL")
   const [search, setSearch] = useState("")
   const { isPhone } = useResize()
   const dispatch = useDispatch()

   const { tasks, error, loading } = useSelector(state => {
      return state.tasksReducer
   })

   useEffect(() => {
      dispatch(getTasks(tasksfromWho === "ME" ? "me" : ""))
   }, [tasksfromWho, dispatch])

   useEffect(() => {
      if (tasks?.length) {
         setList(tasks)
         setRenderList(tasks)
      }
   }, [tasks])

   useEffect(() => {
      if (search)
         setRenderList(list.filter(data => data.title.startsWith(search)))
      else setRenderList(list)
   }, [search])

   const renderAllCards = () => {
      return renderList?.map(data => (
         <Card
            key={data._id}
            data={data}
            deleteCard={handleDelete}
            editCardStatus={handleEditCardStatus}
         />
      ))
   }

   const renderColumnCards = text => {
      return renderList
         ?.filter(data => data.status === text)
         .map(data => (
            <Card
               key={data._id}
               data={data}
               deleteCard={handleDelete}
               editCardStatus={handleEditCardStatus}
            />
         ))
   }

   const handleChangeImportance = event => {
      if (event.currentTarget.value === "ALL") setRenderList(list)
      else
         setRenderList(
            list.filter(data => data.importance === event.currentTarget.value)
         )
   }

   const handleSearch = debounce(event => {
      setSearch(event?.target?.value)
   }, 1000)

   const handleDelete = id => {
      dispatch(deleteTask(id))
   }

   const handleEditCardStatus = data => {
      dispatch(editTaskStatus(data))
   }

   if (error) return <div>Hay un error</div>

   return (
      <>
         <Header />
         <main id="tasks">
            <TaskForm />
            <section className="wrapper_list">
               <div className="list_header">
                  <div>
                     <h2>Mis tareas</h2>
                  </div>
                  <div className="filters">
                     <FormControl>
                        <RadioGroup
                           row
                           aria-labelledby="demo-row-radio-buttons-group-label"
                           onChange={event =>
                              setTasksfromWho(event.currentTarget.value)
                           }
                        >
                           <FormControlLabel
                              value="ALL"
                              control={<Radio />}
                              label="Todas"
                           />
                           <FormControlLabel
                              value="ME"
                              control={<Radio />}
                              label="Mis tareas"
                           />
                        </RadioGroup>
                     </FormControl>
                     <div className="search">
                        <input
                           type="text"
                           placeholder="Buscar por título..."
                           onChange={handleSearch}
                        />
                     </div>
                     <select
                        name="importance"
                        onChange={handleChangeImportance}
                     >
                        <option value="">Seleccionar una prioridad</option>
                        <option value="ALL">Todas</option>
                        <option value="LOW">Baja</option>
                        <option value="MEDIUM">Media</option>
                        <option value="HIGH">Alta</option>
                     </select>
                  </div>
               </div>
               {isPhone ? (
                  !renderList?.length ? (
                     <div>No hay tareas creadas</div>
                  ) : loading ? (
                     <>
                        <Skeleton height={90} />
                        <Skeleton height={90} />
                        <Skeleton height={90} />
                     </>
                  ) : (
                     <div className="list phone">{renderAllCards()}</div>
                  )
               ) : (
                  <div className="list_group">
                     {!renderList?.length ? (
                        <div>No hay tareas creadas</div>
                     ) : loading ? (
                        <Skeleton />
                     ) : (
                        <>
                           <div className="list">
                              <h4>Nuevas</h4>
                              {renderColumnCards("NEW")}
                           </div>
                           <div className="list">
                              <h4>En proceso</h4>
                              {renderColumnCards("IN PROGRESS")}
                           </div>
                           <div className="list">
                              <h4>Finalizadas</h4>
                              {renderColumnCards("FINISHED")}
                           </div>
                        </>
                     )}
                  </div>
               )}
            </section>
         </main>
      </>
   )
}
