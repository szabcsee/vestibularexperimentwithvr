/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _objects, _camera, _domElement ) {

	if ( _objects instanceof THREE.Camera ) {

		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;

	}

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;

	//

	var scope = this;

	function activate() {

		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function deactivate() {

		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function dispose() {

		deactivate();

	}

	// Drag constrains (eg. move along x-axis only, y only, x and y, or default xyz)
	var moveX, moveY, moveZ;
	moveX = moveY = moveZ = true;

	this.constrains = function(xyz) {

		if (xyz === undefined)
			xyz = 'xyz';

		moveX = moveY = moveZ = false;

		if (xyz.indexOf('x') > -1) {
			moveX = true;
		}

		if (xyz.indexOf('y') > -1) {
			moveY = true;
		}

		if (xyz.indexOf('z') > -1) {
			moveZ = true;
		}

		return this;

	};


	function onDocumentMouseMove( event ) {
	var rotationDrag = false;

		event.preventDefault();

		var rect = _domElement.getBoundingClientRect();
		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {
			if (event.altKey === true) {
				rotationDrag = true;
			}

//TODO: somewhere here should be a rotationDrag check and if it's true than rotate the line instead of moving it
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				/**
				 *  Constrain feature added
				 */

				_intersection.sub( _offset );
				//_selected.position.copy( _intersection.sub( _offset ) );
				if (!rotationDrag) {
					if (moveX) _selected.position.x = _intersection.x;
					if (moveY) _selected.position.y = _intersection.y;
					if (moveZ) _selected.position.z = _intersection.z;
				} else {
					debugger;

					_selected.rotateZ(0.018);
				}
			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );

			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {

		event.preventDefault();

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_offset.copy( _intersection ).sub( _selected.position );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentMouseCancel( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	function onDocumentTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_selected.position.copy( _intersection.sub( _offset ) );

			}

			scope.dispatchEvent( { type: 'drag', object: _selected } );

			return;

		}

	}

	function onDocumentTouchStart( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _selected.position );

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_offset.copy( _intersection ).sub( _selected.position );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _selected } );

		}


	}

	function onDocumentTouchEnd( event ) {

		event.preventDefault();

		if ( _selected ) {

			scope.dispatchEvent( { type: 'dragend', object: _selected } );

			_selected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
