from datetime import datetime
from flask import jsonify, request
from flask_login import current_user, login_required


def update_list(app, database):
  db = database['db']
  List = database['tables']['List']
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
        list_name = data['list_name'].strip() or list.list_name
        description = data['description'].strip() or list.description
        strict = bool(data['strict'].strip()) or list.strict
        if not list:
          return jsonify({
            'error': 'List not found'
          }), 404
    
        list.list_name = list_name
        list.description = description
        list.strict = strict
        list.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify({
          'message': 'List updated successfully'
        }), 200
    except Exception as e:
      return jsonify({
        'error': str(e)
      }), 500