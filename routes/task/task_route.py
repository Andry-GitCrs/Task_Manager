from . import(
  add_task,
  delete_task,
  find_task,
  get_task_by_date,
  get_tasks,
  get_today_tasks,
  get_upcoming_tasks,
  update_task
)

def use_task_route(app, database):
  routes = [
    get_tasks.get_tasks,
    add_task.add_task,
    update_task.update_task,
    delete_task.delete_task,
    get_task_by_date.get_task_by_date,
    get_today_tasks.get_today_task,
    get_upcoming_tasks.get_upcoming_task,
    find_task.find_task
  ]

  for route in routes:
    route(app, database)