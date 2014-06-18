jQuery.each(Waypoint.adapters, function(i, adapter) {
  describe(adapter.name + ' adapter: ', function() {
    describe('Waypoint', function() {
      var $ = jQuery
      var standard = 50
      var hit, $scroller, waypoint, $target, returnValue

      function setHitTrue() {
        hit = true
      }

      function hitToBeTrue() {
        return hit
      }

      beforeEach(function() {
        Waypoint.Adapter = adapter.Adapter
        loadFixtures('standard.html')
        $scroller = $(window)
        hit = false
        waypoint = null
      })

      afterEach(function() {
        if (waypoint) {
          waypoint.destroy()
        }
        $scroller.scrollTop(0).scrollLeft(0)
        waits(standard)
      })

      describe('new Waypoint()', function() {
        it('errors out', function() {
          expect(function() {
            new Waypoint()
          }).toThrow()
        })
      })

      describe('new Waypoint(options)', function() {
        it('returns an instance of the Waypoint class', function() {
          waypoint = new Waypoint({
            element: document.getElementById('same1')
          })
          expect(waypoint instanceof Waypoint).toBeTruthy()
        })

        it('requires the element option', function() {
          expect(function() {
            new Waypoint({})
          }).toThrow()
        })

        it('triggers down on new already-reached waypoints', function() {
          runs(function() {
            $target = $('#same2')
            $scroller.scrollTop($target.offset().top + 1)
          })
          waits(standard)
          runs(function() {
            waypoint = new Waypoint({
              element: $target[0],
              handler: function(direction) {
                hit = direction === 'down'
              }
            })
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })
      })

      describe('handler option', function() {
        var currentDirection

        beforeEach(function() {
          $target = $('#same1')
          currentDirection = null
          waypoint = new Waypoint({
            element: $target[0],
            handler: function(direction) {
              currentDirection = direction
            }
          })
        })

        it('triggers with direction parameter', function() {
          runs(function() {
            $scroller.scrollTop($target.offset().top)
          })
          waitsFor(function() {
            return currentDirection === 'down'
          }, 'down to trigger')
          runs(function() {
            $scroller.scrollTop($target.offset().top - 1)
          })
          waitsFor(function() {
            return currentDirection === 'up'
          }, 'up to trigger')
        })
      })

      describe('offset option', function() {
        beforeEach(function() {
          $target = $('#same1')
        })

        it('takes a px offset', function(){
          runs(function() {
            waypoint = new Waypoint({
              element: $target[0],
              handler: setHitTrue,
              offset: 50
            })
            $scroller.scrollTop($target.offset().top - 51)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop($target.offset().top - 50)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })

        it('takes a % offset', function() {
          var trigger = $target.offset().top - Waypoint.viewportHeight() * .37
          runs(function() {
            waypoint = new Waypoint({
              element: $target[0],
              handler: setHitTrue,
              offset: '37%'
            })
            $scroller.scrollTop(trigger - 1)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop(trigger)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })

        it('takes a function offset', function() {
          runs(function() {
            waypoint = new Waypoint({
              element: $target[0],
              handler: setHitTrue,
              offset: function() {
                return -$(this.element).height()
              }
            })
            $scroller.scrollTop($target.offset().top + $target.height() - 1)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop($target.offset().top + $target.height())
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })

        it('takes a botton-in-view function alias', function() {
          var top = $target.offset().top
          var height = $target.outerHeight()
          var windowHeight = Waypoint.viewportHeight()
          var inview = top + height - windowHeight
          runs(function() {
            waypoint = new Waypoint({
              element: $target[0],
              handler: setHitTrue,
              offset: 'bottom-in-view'
            })
            $scroller.scrollTop(inview - 1)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop(inview)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })
      })

      describe('triggerOnce option', function() {
        it('destroys the waypoint after first trigger', function() {
          runs(function() {
            $target = $('#same1')
            waypoint = new Waypoint({
              element: $target[0],
              triggerOnce: true
            })
            $scroller.scrollTop($target.offset().top)
          })
          waitsFor(function() {
            return !waypoint.context.waypoints.vertical[waypoint.key]
          }, 'waypoint to be destroyed')
        })
      })

      describe('context option', function() {
        beforeEach(function() {
          $scroller = $('#bottom')
          $target = $('#inner3')
        })

        it('works with px offset', function() {
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue,
            context: $scroller[0],
            offset: 10
          })
          runs(function() {
            $scroller.scrollTop(189)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop(190)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })

        it('works with % offset', function() {
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue,
            context: $scroller[0],
            offset: '100%'
          })
          runs(function() {
            $scroller.scrollTop(149)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop(150)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })

        it('works with function offset', function() {
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue,
            context: $scroller[0],
            offset: function() {
              return $(this.element).height() / 2
            }
          })
          runs(function() {
            $scroller.scrollTop(149)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop(150)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })

        it('works with bottom-in-view offset alias', function() {
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue,
            context: $scroller[0],
            offset: 'bottom-in-view'
          })
          runs(function() {
            $scroller.scrollTop(249)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
            $scroller.scrollTop(250)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })
      })

      describe('horizontal option', function() {
        var currentDirection

        beforeEach(function() {
          currentDirection = null
          $target = $('#same1')
          waypoint = new Waypoint({
            element: $target[0],
            horizontal: true,
            handler: function(direction) {
              currentDirection = direction
            }
          })
        })

        it('triggers right/left directions', function() {
          runs(function() {
            $scroller.scrollLeft($target.offset().left)
          })
          waitsFor(function() {
            return currentDirection === 'right'
          }, 'right direction to trigger')
          runs(function() {
            $scroller.scrollLeft($target.offset().left - 1)
          })
          waitsFor(function() {
            return currentDirection === 'left'
          })
        })
      })

      describe('continuous option', function() {
        var $later, laterWaypoint, hitCount, hitWaypoint

        function incrementHitCount(direction) {
          hitCount += 1
          hitWaypoint = this
        }

        beforeEach(function() {
          $target = $('#same1')
          $later = $('#near1')
          hitCount = 0
          waypoint = new Waypoint({
            element: $target[0],
            continuous: false,
            handler: incrementHitCount
          })
          laterWaypoint = new Waypoint({
            element: $later[0],
            continuous: false,
            handler: incrementHitCount
          })
        })

        afterEach(function() {
          laterWaypoint.destroy()
        })

        it('does not trigger the earlier waypoint', function() {
          runs(function() {
            $scroller.scrollTop($later.offset().top)
          })
          waitsFor(function() {
            return hitCount
          }, 'later callback to trigger')
          runs(function() {
            expect(hitCount).toEqual(1)
            expect(hitWaypoint).toEqual(laterWaypoint)
          })
        })

        it('prevents earlier trigger on refresh', function() {
          runs(function() {
            $target.css('top', '-1px')
            $later.css('top', '-2px')
            Waypoint.refresh()
          })
          waitsFor(function() {
            return hitCount
          }, 'later callback to trigger')
          runs(function() {
            expect(hitCount).toEqual(1)
            expect(hitWaypoint).toEqual(waypoint)
          })
        })
      })

      describe('with window as the waypoint element', function() {
        beforeEach(function() {
          $target = $(window)
          waypoint = new Waypoint({
            element: $target[0],
            offset: -$target.height(),
            handler: setHitTrue
          })
        })

        it('triggers waypoint', function() {
          runs(function() {
            $target.scrollTop($target.height() + 1)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })
      })

      describe('#disable()', function() {
        beforeEach(function() {
          $target = $('#same1')
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue
          })
          returnValue = waypoint.disable()
        })

        it('returns the same waypoint object for chaining', function() {
          expect(returnValue).toEqual(waypoint)
        })

        it('disables callback triggers', function() {
          runs(function() {
            $scroller.scrollTop($target.offset().top)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
          })
        })
      })

      describe('#enable()', function() {
        beforeEach(function() {
          $target = $('#same1')
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue
          })
          waypoint.disable()
          returnValue = waypoint.enable()
        })

        it('returns the same waypoint instance for chaining', function() {
          expect(returnValue).toEqual(waypoint)
        })

        it('enables callback triggers', function() {
          runs(function() {
            $scroller.scrollTop($target.offset().top)
          })
          waitsFor(hitToBeTrue, 'callback to trigger')
        })
      })

      describe('#destroy()', function() {
        beforeEach(function() {
          $target = $('#same1')
          waypoint = new Waypoint({
            element: $target[0],
            handler: setHitTrue
          })
          returnValue = waypoint.destroy()
        })

        it('returns undefined', function() {
          expect(returnValue).toBeUndefined()
        })

        it('no longer triggers callbacks', function() {
          runs(function() {
            $scroller.scrollTop($target.offset().top)
          })
          waits(standard)
          runs(function() {
            expect(hit).toBeFalsy()
          })
        })
      })

      describe('Waypoint.viewportHeight()', function() {
        it('returns window innerHeight if it exists', function() {
          var height = Waypoint.viewportHeight()
          if (window.innerHeight) {
            expect(height).toEqual(window.innerHeight)
          }
          else {
            expect(height).toEqual(document.documentElement.clientHeight)
          }
        })
      })

      describe('Waypoint.refresh()', function() {
        it('is an alias for Waypoint.Context.refreshAll', function() {
          spyOn(Waypoint.Context, 'refreshAll')
          Waypoint.refresh()
          expect(Waypoint.Context.refreshAll).toHaveBeenCalled()
        })
      })
    })
  })
})
