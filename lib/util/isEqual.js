export var isEqual = (a, b) => {
  /* eslint-disable eqeqeq */
  if (!a || !b) {
    return a == b;
  }

  var typea = typeof a;
  var typeb = typeof b;

  if (typea !== typeb) {
    return false;
  }

  if (typea === 'object' && typeb === 'object') {
    var aks = Object.keys(a);
    var bks = Object.keys(b);
    var akl = aks.length;
    var bkl = bks.length;

    if (akl !== bkl) {
      return false;
    } else {
      var flag = true;
      var key = null;

      for (var i = 0; i < akl; i++) {
        key = aks[i];
        flag = isEqual(a[key], b[key]);

        if (!flag) {
          break;
        }
      }

      return flag;
    }
  } else {
    return a == b;
  }
};