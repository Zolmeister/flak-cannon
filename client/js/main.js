(function() {
  var ConversionState, ConversionStore, ExperimentState, ExperimentStore, QueryBuilder, RecoilController, RecoilView, ResultModel, ShowState, SparkLine, isPSignificant, nMinusOneChiSquare, pFromZ,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  SparkLine = function(data) {
    var sparkline;
    sparkline = function($el, isInit) {
      var graph, palette;
      if (isInit) {
        return;
      }
      palette = new Rickshaw.Color.Palette();
      graph = new Rickshaw.Graph({
        element: $el,
        width: 100,
        height: 50,
        renderer: 'line',
        series: [
          {
            data: _.map(data, function(datum, i) {
              return {
                x: i,
                y: datum.count
              };
            }),
            color: palette.color()
          }
        ]
      });
      return graph.render();
    };
    return m('div.sparkline', {
      config: sparkline
    });
  };

  nMinusOneChiSquare = function(aConversions, aTotal, bConversions, bTotal) {
    var N, a, b, c, chi2, d, m, n, r, s, z;
    a = aConversions;
    b = aTotal - aConversions;
    c = bConversions;
    d = bTotal - bConversions;
    r = a + c;
    s = b + d;
    m = a + b;
    n = c + d;
    N = m + n + r + s;
    chi2 = Math.pow(a * d - b * c, 2) * (N - 1) / (m * n * r * s);
    z = Math.sqrt(Math.abs(chi2));
    return 1 - pFromZ(z);
  };

  pFromZ = function(z) {
    var Z_MAX, w, x, y;
    Z_MAX = 6.0;
    if (z === 0.0) {
      x = 0.0;
    } else {
      y = 0.5 * Math.abs(z);
      if (y > (Z_MAX * 0.5)) {
        x = 1.0;
      } else if (y < 1.0) {
        w = y * y;
        x = ((((((((0.000124818987 * w - 0.001075204047) * w + 0.005198775019) * w - 0.019198292004) * w + 0.059054035642) * w - 0.151968751364) * w + 0.319152932694) * w - 0.531923007300) * w + 0.797884560593) * y * 2.0;
      } else {
        y -= 2.0;
        x = (((((((((((((-0.000045255659 * y + 0.000152529290) * y - 0.000019538132) * y - 0.000676904986) * y + 0.001390604284) * y - 0.000794620820) * y - 0.002034254874) * y + 0.006549791214) * y - 0.010557625006) * y + 0.011630447319) * y - 0.009279453341) * y + 0.005353579108) * y - 0.002141268741) * y + 0.000535310849) * y + 0.999936657524;
      }
    }
    if (z > 0.0) {
      return (x + 1.0) * 0.5;
    } else {
      return (1.0 - x) * 0.5;
    }
  };

  isPSignificant = function(p) {
    return p > 0.05;
  };

  ResultModel = (function() {
    function ResultModel() {
      this.query = __bind(this.query, this);
    }

    ResultModel.prototype.transform = function(data) {
      var control;
      data = data.map(function(result) {
        result.totalConversions = _.reduce(result.data, function(sum, datum) {
          return sum + datum.count;
        }, 0);
        return result;
      });
      if (!data[0]) {
        return [];
      }
      control = data[0];
      control.p = 0;
      control.percentDelta = 0;
      data = data.slice(1).map(function(result) {
        var aConversions, aPercent, aTotal, bConversions, bPercent, bTotal, p, percentDelta;
        aConversions = result.totalConversions;
        aTotal = result.participantCount;
        bConversions = control.totalConversions;
        bTotal = control.participantCount;
        aPercent = aConversions / aTotal;
        bPercent = bConversions / bTotal;
        percentDelta = aPercent - bPercent;
        p = nMinusOneChiSquare(aConversions, aTotal, bConversions, bTotal);
        result.p = p;
        result.percentDelta = percentDelta;
        return result;
      });
      data = [control].concat(_.sortBy(data, 'percentDelta').reverse());
      return data;
    };

    ResultModel.prototype.data = (function() {
      var def;
      def = m.deferred();
      def.resolve([]);
      return def.promise;
    })();

    ResultModel.prototype.query = function(q) {
      q = _.defaults(q, {
        experiment: '',
        start: '',
        end: '',
        splits: '',
        conversion: '',
        namespace: ''
      });
      return m.request({
        method: 'GET',
        url: "/api/" + q.namespace + "/experiments/" + q.experiment + "/results\n?from=" + (moment(q.start).format('L')) + "\n&to=" + (moment(q.end).format('L')) + "\n&split=" + q.splits + "\n&conversion=" + q.conversion
      }).then(this.transform).then(this.data);
    };

    return ResultModel;

  })();

  QueryBuilder = function(queryHandler) {
    var conversion, end, experiment, namespace, query, splits, start;
    experiment = m.prop('signupText');
    start = m.prop(moment().subtract('days', 14).format('L').toString());
    end = m.prop(moment().format('L').toString());
    splits = m.prop('');
    conversion = m.prop('signUp');
    namespace = m.prop('');
    query = function() {
      return queryHandler({
        experiment: experiment(),
        start: start(),
        end: end(),
        splits: splits(),
        conversion: conversion(),
        namespace: namespace()
      });
    };
    return function() {
      return m('div', [
        m('input', {
          value: namespace(),
          placeholder: 'namespace',
          onchange: m.withAttr('value', namespace)
        }), m('input', {
          value: experiment(),
          placeholder: 'experiment',
          onchange: m.withAttr('value', experiment)
        }), m('input', {
          value: start(),
          placeholder: 'start',
          onchange: m.withAttr('value', start)
        }), m('input', {
          value: end(),
          placeholder: 'end',
          onchange: m.withAttr('value', end)
        }), m('input', {
          value: splits(),
          placeholder: 'splits (, separated)',
          onchange: m.withAttr('value', splits)
        }), m('input', {
          value: conversion(),
          placeholder: 'conversion',
          onchange: m.withAttr('value', conversion)
        }), m('button', {
          onclick: query
        }, 'go')
      ]);
    };
  };

  ExperimentStore = (function() {
    var data;
    data = m.request({
      method: 'GET',
      url: '/api/fake/experiments'
    });
    return {
      getAll: function() {
        return data;
      }
    };
  })();

  ConversionStore = (function() {
    var data;
    data = m.request({
      method: 'GET',
      url: '/api/fake/conversions/uniq'
    });
    return {
      getAll: function() {
        return data;
      }
    };
  })();

  ExperimentState = function(experiments) {
    return m('ul', experiments.map(function(experiment) {
      return m('li', [
        experiment.name + (" (" + experiment.namespace + ")"), m('ul', experiment.values.map(function(val) {
          return m('li', val);
        }))
      ]);
    }));
  };

  ConversionState = function(conversions) {
    return m('ul', conversions.map(function(conversion) {
      return m('li', conversion.name + (" (" + conversion.namespace + ")"));
    }));
  };

  ShowState = function(experiments, conversions) {
    return ['Experiments', ExperimentState(experiments), 'Conversions', ConversionState(conversions)];
  };

  RecoilController = function() {
    var results;
    results = new ResultModel;
    return {
      results: results,
      experiments: ExperimentStore.getAll(),
      conversions: ConversionStore.getAll(),
      queryBuilder: QueryBuilder(results.query)
    };
  };

  RecoilView = function(ctrl) {
    var percent, results, titles;
    results = ctrl.results.data() || [];
    titles = ['test', 'sparkline'].concat(results[0] ? _.keys(results[0].splits) : void 0).concat(['conversions', 'participants', 'percent', 'p < 0.05', 'delta']);
    percent = function(n) {
      return (n * 100).toFixed(2) + '%';
    };
    return [
      ShowState(ctrl.experiments(), ctrl.conversions()), m('br'), ctrl.queryBuilder(), m('br'), !results.length ? 'NO RESULTS' : void 0, m('table', titles.map(m.bind(m, 'th')).concat(_.map(_.values(results), function(result) {
        var color;
        color = result.percentDelta > 0 ? 'green' : result.percentDelta === 0 ? 'black' : 'red';
        return m('tr', [m('td', result.test), m('td', [SparkLine(result.data)])].concat(_.map(_.values(result.splits), m.bind(m, 'td'))).concat([
          m('td', result.totalConversions), m('td', result.participantCount), m('td', percent(result.totalConversions / result.participantCount)), m('td', result.p.toFixed(3)), m('td', {
            style: {
              color: color
            }
          }, percent(result.percentDelta))
        ]));
      })))
    ];
  };

  m.module(document.getElementById('recoil'), {
    controller: RecoilController,
    view: RecoilView
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZMQUFBO0lBQUEsa0ZBQUE7O0FBQUEsRUFBQSxTQUFBLEdBQVksU0FBQyxJQUFELEdBQUE7QUFDVixRQUFBLFNBQUE7QUFBQSxJQUFBLFNBQUEsR0FBWSxTQUFDLEdBQUQsRUFBTSxNQUFOLEdBQUE7QUFDVixVQUFBLGNBQUE7QUFBQSxNQUFBLElBQUcsTUFBSDtBQUNFLGNBQUEsQ0FERjtPQUFBO0FBQUEsTUFHQSxPQUFBLEdBQWMsSUFBQSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQWYsQ0FBQSxDQUhkLENBQUE7QUFBQSxNQUlBLEtBQUEsR0FBWSxJQUFBLFFBQVEsQ0FBQyxLQUFULENBQ1Y7QUFBQSxRQUFBLE9BQUEsRUFBUyxHQUFUO0FBQUEsUUFDQSxLQUFBLEVBQU8sR0FEUDtBQUFBLFFBRUEsTUFBQSxFQUFRLEVBRlI7QUFBQSxRQUdBLFFBQUEsRUFBVSxNQUhWO0FBQUEsUUFJQSxNQUFBLEVBQVE7VUFDTjtBQUFBLFlBQUEsSUFBQSxFQUFNLENBQUMsQ0FBQyxHQUFGLENBQU0sSUFBTixFQUFZLFNBQUMsS0FBRCxFQUFRLENBQVIsR0FBQTtxQkFDaEI7QUFBQSxnQkFBQSxDQUFBLEVBQUcsQ0FBSDtBQUFBLGdCQUNBLENBQUEsRUFBRyxLQUFLLENBQUMsS0FEVDtnQkFEZ0I7WUFBQSxDQUFaLENBQU47QUFBQSxZQUlBLEtBQUEsRUFBTyxPQUFPLENBQUMsS0FBUixDQUFBLENBSlA7V0FETTtTQUpSO09BRFUsQ0FKWixDQUFBO2FBaUJBLEtBQUssQ0FBQyxNQUFOLENBQUEsRUFsQlU7SUFBQSxDQUFaLENBQUE7V0FvQkEsQ0FBQSxDQUFFLGVBQUYsRUFBbUI7QUFBQSxNQUFDLE1BQUEsRUFBUSxTQUFUO0tBQW5CLEVBckJVO0VBQUEsQ0FBWixDQUFBOztBQUFBLEVBd0NBLGtCQUFBLEdBQXFCLFNBQUMsWUFBRCxFQUFlLE1B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Q0FJUCxDQUFDLENBQUMsR0FBRixDQUFNLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBTSxDQUFDLE1BQWhCLENBQU4sRUFBK0IsQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFQLEVBQVUsSUFBVixDQUEvQixDQUpPLENBS2YsQ0FBQyxNQUxjLENBS1A7VUFDTixDQUFBLENBQUUsSUFBRixFQUFRLE1BQU0sQ0FBQyxnQkFBZixDQURNLEVBRU4sQ0FBQSxDQUFFLElBQUYsRUFBUSxNQUFNLENBQUMsZ0JBQWYsQ0FGTSxFQUdOLENBQUEsQ0FBRSxJQUFGLEVBQVEsT0FBQSxDQUFRLE1BQU0sQ0FBQyxnQkFBUCxHQUEwQixNQUFNLENBQUMsZ0JBQXpDLENBQVIsQ0FITSxFQUlOLENBQUEsQ0FBRSxJQUFGLEVBQVEsTUFBTSxDQUFDLENBQUMsQ0FBQyxPQUFULENBQWlCLENBQWpCLENBQVIsQ0FKTSxFQUtOLENBQUEsQ0FBRSxJQUFGLEVBQVE7QUFBQSxZQUFBLEtBQUEsRUFBTztBQUFBLGNBQUEsS0FBQSxFQUFPLEtBQVA7YUFBUDtXQUFSLEVBQTZCLE9BQUEsQ0FBUSxNQUFNLENBQUMsWUFBZixDQUE3QixDQUxNO1NBTE8sQ0FBUixDQUFQLENBSitCO01BQUEsQ0FBekIsQ0FERyxDQUFYLENBTks7S0FBUCxDQVZXO0VBQUEsQ0FuUGIsQ0FBQTs7QUFBQSxFQXVSQSxDQUFDLENBQUMsTUFBRixDQUFTLFFBQVEsQ0FBQyxjQUFULENBQXdCLFFBQXhCLENBQVQsRUFDUTtBQUFBLElBQUMsVUFBQSxFQUFZLGdCQUFiO0FBQUEsSUFBK0IsSUFBQSxFQUFNLFVBQXJDO0dBRFIsQ0F2UkEsQ0FBQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiU3BhcmtMaW5lID0gKGRhdGEpIC0+XG4gIHNwYXJrbGluZSA9ICgkZWwsIGlzSW5pdCkgLT5cbiAgICBpZiBpc0luaXRcbiAgICAgIHJldHVyblxuXG4gICAgcGFsZXR0ZSA9IG5ldyBSaWNrc2hhdy5Db2xvci5QYWxldHRlKClcbiAgICBncmFwaCA9IG5ldyBSaWNrc2hhdy5HcmFwaFxuICAgICAgZWxlbWVudDogJGVsXG4gICAgICB3aWR0aDogMTAwXG4gICAgICBoZWlnaHQ6IDUwXG4gICAgICByZW5kZXJlcjogJ2xpbmUnXG4gICAgICBzZXJpZXM6IFtcbiAgICAgICAgZGF0YTogXy5tYXAoZGF0YSwgKGRhdHVtLCBpKSAtPlxuICAgICAgICAgIHg6IGlcbiAgICAgICAgICB5OiBkYXR1bS5jb3VudFxuICAgICAgICApXG4gICAgICAgIGNvbG9yOiBwYWxldHRlLmNvbG9yKClcbiAgICAgIF1cblxuICAgIGdyYXBoLnJlbmRlcigpXG5cbiAgbSAnZGl2LnNwYXJrbGluZScsIHtjb25maWc6IHNwYXJrbGluZX1cblxuIyBEZXRlcm1pbmUgaWYgdHdvIHZhbHVlcyBhcmUgc3RhdGlzdGljYWxseSBkaWZmZXJlbnRcbiMgcmV0dXJucyB0aGUgcC12YWx1ZVxuI1xuIyBodHRwOi8vd3d3LmlhbmNhbXBiZWxsLmNvLnVrL3R3b2J5dHdvL24tMV90aGVvcnkuaHRtXG4jIEIgaXMgc3VjY2Vzc2Z1bCBjb252ZXJpb25zXG4jIG5vdC1CIGlzIHVuc3VjY2Vzc2Z1bCBjb252ZXJzaW9uc1xuIyBBIGlzIHRlc3QgMVxuIyBub3QtQSBpcyB0ZXN0IDJcbiNcbiMgZm9ybXVsYVxuIyAoYSpkIC0gYipjKSoqMiAqIChOIC0xKSAvIChtKm4qcipzKVxuI1xuIyAgICAgICAgICBCICBub3QtQiAgVG90YWxcbiMgQSAgICAgfCAgYSAgICBiICAgICAgbVxuIyBub3QtQSB8ICBjICAgIGQgICAgICBuXG4jIFRvdGFsIHwgIHIgICAgcyAgICAgIE5cbiNcbm5NaW51c09uZUNoaVNxdWFyZSA9IChhQ29udmVyc2lvbnMsIGFUb3RhbCwgYkNvbnZlcnNpb25zLCBiVG90YWwpIC0+XG4gIGEgPSBhQ29udmVyc2lvbnNcbiAgYiA9IGFUb3RhbCAtIGFDb252ZXJzaW9uc1xuICBjID0gYkNvbnZlcnNpb25zXG4gIGQgPSBiVG90YWwgLSBiQ29udmVyc2lvbnNcblxuICByID0gYSArIGNcbiAgcyA9IGIgKyBkXG4gIG0gPSBhICsgYlxuICBuID0gYyArIGRcbiAgTiA9IG0gKyBuICsgciArIHNcblxuICBjaGkyID0gKGEqZCAtIGIqYykqKjIgKiAoTiAtIDEpIC8gKG0qbipyKnMpXG4gIHogPSBNYXRoLnNxcnQoTWF0aC5hYnMoY2hpMikpXG4gIDEgLSBwRnJvbVooeilcblxucEZyb21aID0gKHopIC0+XG4gIFpfTUFYID0gNi4wXG5cbiAgaWYgeiA9PSAwLjBcbiAgICB4ID0gMC4wXG4gIGVsc2VcbiAgICB5ID0gMC41ICogTWF0aC5hYnMoeilcbiAgICBpZiB5ID4gKFpfTUFYICogMC41KVxuICAgICAgeCA9IDEuMFxuICAgIGVsc2UgaWYgeSA8IDEuMFxuICAgICAgdyA9IHkgKiB5XG4gICAgICB4ID0gKCgoKCgoKCgwLjAwMDEyNDgxODk4NyAqIHcgLVxuICAgICAgICAgICAgICAgICAgMC4wMDEwNzUyMDQwNDcpICogdyArIDAuMDA1MTk4Nzc1MDE5KSAqIHcgLVxuICAgICAgICAgICAgICAgICAgMC4wMTkxOTgyOTIwMDQpICogdyArIDAuMDU5MDU0MDM1NjQyKSAqIHcgLVxuICAgICAgICAgICAgICAgICAgMC4xNTE5Njg3NTEzNjQpICogdyArIDAuMzE5MTUyOTMyNjk0KSAqIHcgLVxuICAgICAgICAgICAgICAgICAgMC41MzE5MjMwMDczMDApICogdyArIDAuNzk3ODg0NTYwNTkzKSAqIHkgKiAyLjBcbiAgICBlbHNlXG4gICAgICB5IC09IDIuMFxuICAgICAgeCA9ICgoKCgoKCgoKCgoKCgtMC4wMDAwNDUyNTU2NTkgKiB5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDAwMTUyNTI5MjkwKSAqIHkgLSAwLjAwMDAxOTUzODEzMikgKiB5IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDAwNjc2OTA0OTg2KSAqIHkgKyAwLjAwMTM5MDYwNDI4NCkgKiB5IC1cbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDAwNzk0NjIwODIwKSAqIHkgLSAwLjAwMjAzNDI1NDg3NCkgKiB5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDA2NTQ5NzkxMjE0KSAqIHkgLSAwLjAxMDU1NzYyNTAwNikgKiB5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDExNjMwNDQ3MzE5KSAqIHkgLSAwLjAwOTI3OTQ1MzM0MSkgKiB5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDA1MzUzNTc5MTA4KSAqIHkgLSAwLjAwMjE0MTI2ODc0MSkgKiB5ICtcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDAwNTM1MzEwODQ5KSAqIHkgKyAwLjk5OTkzNjY1NzUyNFxuICBpZiB6ID4gMC4wIHRoZW4gKCh4ICsgMS4wKSAqIDAuNSkgZWxzZSAoKDEuMCAtIHgpICogMC41KVxuXG5pc1BTaWduaWZpY2FudCA9IChwKSAtPlxuICBwID4gMC4wNVxuXG5jbGFzcyBSZXN1bHRNb2RlbFxuICB0cmFuc2Zvcm06KGRhdGEpIC0+XG5cbiAgICAjIGNvdW50IHRvdGFsIGNvbnZlcnNpb25zXG4gICAgZGF0YSA9IGRhdGEubWFwIChyZXN1bHQpIC0+XG4gICAgICByZXN1bHQudG90YWxDb252ZXJzaW9ucyA9IF8ucmVkdWNlKHJlc3VsdC5kYXRhLCAoc3VtLCBkYXR1bSkgLT5cbiAgICAgICAgc3VtICsgZGF0dW0uY291bnRcbiAgICAgICwgMClcbiAgICAgIHJldHVybiByZXN1bHRcblxuICAgICMgY2FsY3VsYXRlIHAtdmFsdWUgYW5kIHBlcmNlbnRhZ2UgY2hhbmdlIGFnYWluc3QgdGhlIGZpcnN0IHJlc3VsdFxuICAgIGlmICFkYXRhWzBdXG4gICAgICByZXR1cm4gW11cbiAgICBjb250cm9sID0gZGF0YVswXVxuICAgIGNvbnRyb2wucCA9IDBcbiAgICBjb250cm9sLnBlcmNlbnREZWx0YSA9IDBcblxuICAgIGRhdGEgPSBkYXRhLnNsaWNlKDEpLm1hcCAocmVzdWx0KSAtPlxuICAgICAgYUNvbnZlcnNpb25zID0gcmVzdWx0LnRvdGFsQ29udmVyc2lvbnNcbiAgICAgIGFUb3RhbCA9IHJlc3VsdC5wYXJ0aWNpcGFudENvdW50XG4gICAgICBiQ29udmVyc2lvbnMgPSBjb250cm9sLnRvdGFsQ29udmVyc2lvbnNcbiAgICAgIGJUb3RhbCA9IGNvbnRyb2wucGFydGljaXBhbnRDb3VudFxuXG4gICAgICBhUGVyY2VudCA9IGFDb252ZXJzaW9ucyAvIGFUb3RhbFxuICAgICAgYlBlcmNlbnQgPSBiQ29udmVyc2lvbnMgLyBiVG90YWxcbiAgICAgIHBlcmNlbnREZWx0YSA9IGFQZXJjZW50IC0gYlBlcmNlbnRcblxuICAgICAgcCA9IG5NaW51c09uZUNoaVNxdWFyZShcbiAgICAgICAgYUNvbnZlcnNpb25zLFxuICAgICAgICBhVG90YWwsXG4gICAgICAgIGJDb252ZXJzaW9ucyxcbiAgICAgICAgYlRvdGFsKVxuXG4gICAgICByZXN1bHQucCA9IHBcbiAgICAgIHJlc3VsdC5wZXJjZW50RGVsdGEgPSBwZXJjZW50RGVsdGFcblxuICAgICAgcmV0dXJuIHJlc3VsdFxuXG4gICAgZGF0YSA9IFtjb250cm9sXS5jb25jYXQgXy5zb3J0QnkoZGF0YSwgJ3BlcmNlbnREZWx0YScpLnJldmVyc2UoKVxuICAgIHJldHVybiBkYXRhXG5cblxuICBkYXRhOiBkbyAtPlxuICAgIGRlZiA9IG0uZGVmZXJyZWQoKVxuICAgIGRlZi5yZXNvbHZlKFtdKVxuICAgIGRlZi5wcm9taXNlXG4gIHF1ZXJ5OiAocSkgPT5cbiAgICBxID0gXy5kZWZhdWx0cyBxLFxuICAgICAgIGV4cGVyaW1lbnQ6ICcnXG4gICAgICAgc3RhcnQ6ICcnXG4gICAgICAgZW5kOiAnJ1xuICAgICAgIHNwbGl0czogJydcbiAgICAgICBjb252ZXJzaW9uOiAnJ1xuICAgICAgIG5hbWVzcGFjZTogJydcblxuICAgIG0ucmVxdWVzdFxuICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgdXJsOiBcIlwiXCIvYXBpLyN7cS5uYW1lc3BhY2V9L2V4cGVyaW1lbnRzLyN7cS5leHBlcmltZW50fS9yZXN1bHRzXG4gICAgICAgID9mcm9tPSN7bW9tZW50KHEuc3RhcnQpLmZvcm1hdCgnTCcpfVxuICAgICAgICAmdG89I3ttb21lbnQocS5lbmQpLmZvcm1hdCgnTCcpfVxuICAgICAgICAmc3BsaXQ9I3txLnNwbGl0c31cbiAgICAgICAgJmNvbnZlcnNpb249I3txLmNvbnZlcnNpb259XCJcIlwiXG4gICAgLnRoZW4oQHRyYW5zZm9ybSkudGhlbihAZGF0YSlcblxuUXVlcnlCdWlsZGVyID0gKHF1ZXJ5SGFuZGxlcikgLT5cbiAgZXhwZXJpbWVudCA9IG0ucHJvcCAnc2lnbnVwVGV4dCdcbiAgc3RhcnQgPSBtLnByb3AgbW9tZW50KCkuc3VidHJhY3QoJ2RheXMnLCAxNCkuZm9ybWF0KCdMJykudG9TdHJpbmcoKVxuICBlbmQgPSBtLnByb3AgbW9tZW50KCkuZm9ybWF0KCdMJykudG9TdHJpbmcoKVxuICBzcGxpdHMgPSBtLnByb3AgJydcbiAgY29udmVyc2lvbiA9IG0ucHJvcCAnc2lnblVwJ1xuICBuYW1lc3BhY2UgPSBtLnByb3AgJydcblxuICBxdWVyeSA9IC0+XG4gICAgcXVlcnlIYW5kbGVyXG4gICAgICBleHBlcmltZW50OiBleHBlcmltZW50KClcbiAgICAgIHN0YXJ0OiBzdGFydCgpXG4gICAgICBlbmQ6IGVuZCgpXG4gICAgICBzcGxpdHM6IHNwbGl0cygpLFxuICAgICAgY29udmVyc2lvbjogY29udmVyc2lvbigpXG4gICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZSgpXG5cbiAgLT5cbiAgICBtICdkaXYnLCBbXG4gICAgICBtICdpbnB1dCcsXG4gICAgICAgIHZhbHVlOiBuYW1lc3BhY2UoKVxuICAgICAgICBwbGFjZWhvbGRlcjogJ25hbWVzcGFjZSdcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgbmFtZXNwYWNlKVxuICAgICAgbSAnaW5wdXQnLFxuICAgICAgICB2YWx1ZTogZXhwZXJpbWVudCgpXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnZXhwZXJpbWVudCdcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgZXhwZXJpbWVudClcbiAgICAgIG0gJ2lucHV0JyxcbiAgICAgICAgdmFsdWU6IHN0YXJ0KClcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdzdGFydCdcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc3RhcnQpXG4gICAgICBtICdpbnB1dCcsXG4gICAgICAgIHZhbHVlOiBlbmQoKVxuICAgICAgICBwbGFjZWhvbGRlcjogJ2VuZCdcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgZW5kKVxuICAgICAgbSAnaW5wdXQnLFxuICAgICAgICB2YWx1ZTogc3BsaXRzKClcbiAgICAgICAgcGxhY2Vob2xkZXI6ICdzcGxpdHMgKCwgc2VwYXJhdGVkKSdcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgc3BsaXRzKVxuICAgICAgbSAnaW5wdXQnLFxuICAgICAgICB2YWx1ZTogY29udmVyc2lvbigpXG4gICAgICAgIHBsYWNlaG9sZGVyOiAnY29udmVyc2lvbidcbiAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgY29udmVyc2lvbilcbiAgICAgIG0gJ2J1dHRvbicsXG4gICAgICAgIG9uY2xpY2s6IHF1ZXJ5LFxuICAgICAgICAnZ28nXG4gICAgXVxuXG5FeHBlcmltZW50U3RvcmUgPSBkbyAtPlxuICBkYXRhID0gbS5yZXF1ZXN0XG4gICAgbWV0aG9kOiAnR0VUJ1xuICAgIHVybDogJy9hcGkvZmFrZS9leHBlcmltZW50cydcblxuICBnZXRBbGw6IC0+XG4gICAgZGF0YVxuXG5Db252ZXJzaW9uU3RvcmUgPSBkbyAtPlxuICBkYXRhID0gbS5yZXF1ZXN0XG4gICAgbWV0aG9kOiAnR0VUJ1xuICAgIHVybDogJy9hcGkvZmFrZS9jb252ZXJzaW9ucy91bmlxJ1xuXG4gIGdldEFsbDogLT5cbiAgICBkYXRhXG5cbkV4cGVyaW1lbnRTdGF0ZSA9IChleHBlcmltZW50cykgLT5cbiAgbSAndWwnLCBleHBlcmltZW50cy5tYXAgKGV4cGVyaW1lbnQpIC0+XG4gICAgbSAnbGknLCBbXG4gICAgICBleHBlcmltZW50Lm5hbWUgKyBcIiAoI3tleHBlcmltZW50Lm5hbWVzcGFjZX0pXCIsXG4gICAgICBtICd1bCcsXG4gICAgICAgIGV4cGVyaW1lbnQudmFsdWVzLm1hcCAodmFsKSAtPlxuICAgICAgICAgIG0gJ2xpJywgdmFsXG4gICAgXVxuXG5Db252ZXJzaW9uU3RhdGUgPSAoY29udmVyc2lvbnMpIC0+XG4gIG0gJ3VsJywgY29udmVyc2lvbnMubWFwIChjb252ZXJzaW9uKSAtPlxuICAgIG0gJ2xpJywgY29udmVyc2lvbi5uYW1lICsgXCIgKCN7Y29udmVyc2lvbi5uYW1lc3BhY2V9KVwiXG5cblNob3dTdGF0ZSA9IChleHBlcmltZW50cywgY29udmVyc2lvbnMpIC0+XG4gIFtcbiAgICAnRXhwZXJpbWVudHMnLFxuICAgIEV4cGVyaW1lbnRTdGF0ZShleHBlcmltZW50cyksXG4gICAgJ0NvbnZlcnNpb25zJyxcbiAgICBDb252ZXJzaW9uU3RhdGUoY29udmVyc2lvbnMpXG4gIF1cblxuUmVjb2lsQ29udHJvbGxlciA9IC0+XG4gIHJlc3VsdHMgPSBuZXcgUmVzdWx0TW9kZWxcbiAgcmVzdWx0czogcmVzdWx0c1xuICBleHBlcmltZW50czogRXhwZXJpbWVudFN0b3JlLmdldEFsbCgpXG4gIGNvbnZlcnNpb25zOiBDb252ZXJzaW9uU3RvcmUuZ2V0QWxsKClcbiAgcXVlcnlCdWlsZGVyOiBRdWVyeUJ1aWxkZXIocmVzdWx0cy5xdWVyeSlcblxuUmVjb2lsVmlldyA9IChjdHJsKSAtPlxuICByZXN1bHRzID0gY3RybC5yZXN1bHRzLmRhdGEoKSBvciBbXVxuICB0aXRsZXMgPSBbJ3Rlc3QnLCAnc3BhcmtsaW5lJ11cbiAgICAuY29uY2F0KGlmIHJlc3VsdHNbMF0gdGhlbiBfLmtleXMocmVzdWx0c1swXS5zcGxpdHMpKVxuICAgIC5jb25jYXQoWydjb252ZXJzaW9ucycsICdwYXJ0aWNpcGFudHMnLFxuICAgICAgICAgICAgICdwZXJjZW50JywgJ3AgPCAwLjA1JywgJ2RlbHRhJ10pXG5cbiAgcGVyY2VudCA9IChuKSAtPlxuICAgIChuICogMTAwKS50b0ZpeGVkKDIpICsgJyUnXG5cbiAgcmV0dXJuIFtcbiAgICBTaG93U3RhdGUoY3RybC5leHBlcmltZW50cygpLCBjdHJsLmNvbnZlcnNpb25zKCkpXG4gICAgbSAnYnInXG4gICAgY3RybC5xdWVyeUJ1aWxkZXIoKVxuICAgIG0gJ2JyJ1xuICAgIHVubGVzcyByZXN1bHRzLmxlbmd0aCB0aGVuICdOTyBSRVNVTFRTJ1xuICAgIG0oJ3RhYmxlJywgdGl0bGVzLm1hcChtLmJpbmQobSwgJ3RoJykpXG4gICAgLmNvbmNhdChfLm1hcChfLnZhbHVlcyhyZXN1bHRzKSwgKHJlc3VsdCkgLT5cbiAgICAgIGNvbG9yID0gaWYgcmVzdWx0LnBlcmNlbnREZWx0YSA+IDAgdGhlbiAnZ3JlZW4nIGVsc2VcbiAgICAgICAgICAgICAgaWYgcmVzdWx0LnBlcmNlbnREZWx0YSA9PSAwIHRoZW4gJ2JsYWNrJyBlbHNlICdyZWQnXG5cbiAgICAgIHJldHVybiBtKCd0cicsIFtcbiAgICAgICAgbSgndGQnLCByZXN1bHQudGVzdCksXG4gICAgICAgIG0oJ3RkJywgW1NwYXJrTGluZShyZXN1bHQuZGF0YSldKVxuICAgICAgXVxuICAgICAgLmNvbmNhdChfLm1hcChfLnZhbHVlcyhyZXN1bHQuc3BsaXRzKSwgbS5iaW5kKG0sICd0ZCcpICkpXG4gICAgICAuY29uY2F0KFtcbiAgICAgICAgbSAndGQnLCByZXN1bHQudG90YWxDb252ZXJzaW9uc1xuICAgICAgICBtICd0ZCcsIHJlc3VsdC5wYXJ0aWNpcGFudENvdW50XG4gICAgICAgIG0gJ3RkJywgcGVyY2VudCByZXN1bHQudG90YWxDb252ZXJzaW9ucyAvIHJlc3VsdC5wYXJ0aWNpcGFudENvdW50XG4gICAgICAgIG0gJ3RkJywgcmVzdWx0LnAudG9GaXhlZCgzKVxuICAgICAgICBtICd0ZCcsIHN0eWxlOiBjb2xvcjogY29sb3IsIHBlcmNlbnQgcmVzdWx0LnBlcmNlbnREZWx0YVxuICAgICAgXSkpXG4gICAgKSkpXG4gIF1cblxubS5tb2R1bGUgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3JlY29pbCcpLFxuICAgICAgICB7Y29udHJvbGxlcjogUmVjb2lsQ29udHJvbGxlciwgdmlldzogUmVjb2lsVmlld31cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==