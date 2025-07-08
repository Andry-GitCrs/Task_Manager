from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required


def update_list(app, database):
  db = database['db']
  List = database['tables']['List']
  Task = database['tables']['Task']
  @app.route('/api/user/list/update', defaults={'list_id': None}, methods=['PUT'])
  @login_required
  def list_update(list_id):
    try:
        list_id = request.args.get('list_id')
        if not list_id:
          return jsonify({
            'error': 'List id is required'
          }), 401
  
        list = List.query.filter_by(list_id = list_id, user_id = current_user.user_id).first()
        data = request.get_json()
        list_name = data['name'].strip() or list.list_name
        description = data['description'].strip() or list.description
        strict = data['important']
        
        if not list:
          return jsonify({
            'error': 'List not found'
          }), 404
        existing_list = List.query.filter(List.list_name == list_name, List.user_id == current_user.user_id, List.list_id != list_id, List.stat == True).first()
        if existing_list:
          return jsonify({
            'error': f'List {list_name} already exist in your list'
          }), 409
        task_nbr = db.session.query(Task).filter(Task.list_id == list.list_id, Task.user_id == current_user.user_id, Task.stat == True).count()
        list.list_name = list_name
        list.description = description
        list.strict = strict
        list.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({
          'message': f'List {list_name} updated successfully',
          'data': {
              'list_id': list.list_id,
              'list_name': list.list_name,
              'description': list.description,
              'strict': list.strict or False,
              'task_nbr': task_nbr
          }
        }), 200
    except Exception as e:
      print(e)
      return jsonify({
        'error': str(e)
      }), 500