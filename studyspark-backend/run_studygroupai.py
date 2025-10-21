import os
import sys
# ensure project root is on path
ROOT = os.path.dirname(__file__)
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from StudyGroupAi import app

if __name__ == '__main__':
    print('Starting StudyGroupAi on 127.0.0.1:5001')
    app.run(host='127.0.0.1', port=5001, debug=False)
