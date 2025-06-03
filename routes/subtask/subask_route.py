from . import(
  add_subtask,
  check_subtask,
  delete_subtask,
  update_subtask
)

def use_subtask_route(app, database):
  routes = [
    add_subtask.add_subtask,
    update_subtask.update_subtask,
    check_subtask.checktask,
    delete_subtask.deleteSubTask
  ]

  for route in routes:
    route(app, database)