var scripts = document.getElementsByTagName("script");
var urlBase = scripts[scripts.length-1].src;
urlBase = urlBase.replace('dw-select.js', '');

// dwFilter
(function( $ ){
  "use strict"

  // Public methods
  let api = {
    init : function(options) {
      const $el = $(this);
      // deploy component structure
      let deployment = new Promise(function(resolve, reject){
        methods.deployComponent($el, options);
        resolve()
      })
      deployment.then(function(){
        methods.getTemplate($el, options);
      })
    },
    destroy: function(){
    },
    val: function($el){
    }
  }

  // Private methods
  let methods = {
    deployComponent: function($el, options){
      // convert the div into a dw-filter component
      $el.addClass('dw-select');
    },

    getTemplate: function($el, options){

      $.get(urlBase + "templates/dw-select.html", function( result ) {
        let templateContent = result;
        methods.setTemplate($el, templateContent, options)
      });

    },

    setTemplate : function($el, templateContent, options){

      let template = _.template(templateContent);
      $el.html( template() );

      if (typeof options !== 'undefined') {
        methods.optionTemplate($el, options)
      } // Todo: falta cuando no trae contenido - $('#sample1').dwSelect()

    },
    optionTemplate: function($el, options){

      let data = options.data[0];

      // If has groups, paint groups containers
      if( data.hasOwnProperty('group') ){
        // define groups
        let groups =  _.chain(options.data).flatten().pluck('group').flatten().unique().value().sort();

        // paint groups containers
        _.each(groups, function(group){
          $el.find('content > .options').append('<div class="group" id="' + group + '"><div class="title"><span class="name">' + group + '</span><span class="open"></span></div></div><div class="group-content ' + group + '"></div>')
        })

        // put options into its group
        $.get(urlBase + "templates/options.html", function( result ) {
            let template = _.template(result);

            let data = _.sortBy(options['data'], 'primary');

            // options each
            data.forEach(data => {
              let contentHtml = template({
                id: data['id'],
                primary: data['primary'],
                secundary: data['secundary'],
                selected: data['selected']
              });
              // paint in specific group content
              let group = data['group'];
              $el.find('.' + group + '.group-content').append(contentHtml);
            });

            events.start($el, options);
          });

      }else{
        // no groups
        // put options into its group
        $.get(urlBase + "templates/options.html", function( result ) {
            let template = _.template(result);

            let data = _.sortBy(options['data'], 'primary');

            // options each
            options['data'].forEach(data => {
              let contentHtml = template({
                id: data['id'],
                primary: data['primary'],
                secundary: data['secundary'],
                selected: data['selected']
              });
              $el.find('content > .options').append(contentHtml);
            });

            events.start($el, options);
          });
      }

    },
    hideOptions: function($el, inputData, options){

      if( options.data[0].hasOwnProperty('group') ){

        let firstLetter = inputData.charAt(0);
        (firstLetter == ':') ? methods.hideGroups($el, inputData, options) : methods.hideOption($el, inputData, options);

      }

    },
    hideOption: function($el, inputData, options){
      let $option = $el.find('.option').toArray();

      $option.forEach(opt => {

        const $opt = $(opt);
        let tempPrimary = $opt.find('.primary').text();
        let tempSecundary = $opt.find('.secundary').text();

        tempPrimary = tempPrimary.toLowerCase();
        tempSecundary = tempSecundary.toLowerCase();

        inputData = inputData.toLowerCase();

        ( tempPrimary.indexOf(inputData) != -1 || tempSecundary.indexOf(inputData) != -1 ) ? $opt.show() : $opt.hide();
        // previene cuando no hay input
        ( inputData == '') ? $opt.show() : false;


      });
    },
    hideGroups: function($el, inputData, options){
      let $groups = $el.find('.options .group').toArray();

      $groups.forEach(grp => {
        const $grp = $(grp);
        let temp = $grp.find('.title .name').text()

        if ( inputData.indexOf(' ') != -1 ){
          let optTemp = inputData.split(' ');

          optTemp[0] = optTemp[0].toLowerCase();
          optTemp[0] = optTemp[0].replace(':','');
          ( temp.indexOf(optTemp[0]) != -1 ) ? $grp.show() : $grp.hide();
          ( temp.indexOf(optTemp[0]) != -1 ) ? $grp.next().show() : $grp.next().hide();

          // previene cuando no hay input
          ( inputData == '') ? $grp.show() : false;
          ( inputData == '') ? $grp.next().show() : false;

          let $option = $el.find('.option').toArray();

          $option.forEach(opt => {

            const $opt = $(opt);
            let tempPrimary = $opt.find('.primary').text();
            let tempSecundary = $opt.find('.secundary').text();

            tempPrimary = tempPrimary.toLowerCase();
            tempSecundary = tempSecundary.toLowerCase();

            optTemp[1] = optTemp[1].toLowerCase();

            ( tempPrimary.indexOf(optTemp[1]) != -1 || tempSecundary.indexOf(optTemp[1]) != -1 ) ? $opt.show() : $opt.hide();

            // previene cuando no hay input
            ( inputData == '') ? $opt.show() : false;
            ( inputData == '') ? $opt.show() : false;

          });

        }else{

          temp = temp.toLowerCase();
          inputData = inputData.replace(':','');
          inputData = inputData.toLowerCase();
          ( temp.indexOf(inputData) != -1 ) ? $grp.show() : $grp.hide();
          ( temp.indexOf(inputData) != -1 ) ? $grp.next().show() : $grp.next().hide();
        }
      });


      // let $option = $el.find('.option').toArray();
      //
      // $option.forEach(opt => {
      //
      //   const $opt = $(opt);
      //   let tempPrimary = $opt .find('.primary').text();
      //   let tempSecundary = $opt .find('.secundary').text();
      //
      //   tempPrimary = tempPrimary.toLowerCase();
      //   tempSecundary = tempSecundary.toLowerCase();
      //
      //   inputData = inputData.toLowerCase();
      //
      //   ( tempPrimary.indexOf(inputData) != -1 ) ? $opt.show() : $opt.hide();
      //   ( tempSecundary.indexOf(inputData) != -1 ) ? $opt.show() : $opt.hide();
      // });

    }

  }




  // Events
    var events = {

      start: function($el, options){
        events.onSearch($el, options);
        events.clearSearch($el, options);
      },

      toggleGroup: function($el, options){
      },

      onSearch: function($el, options){
        let $search = $el.find('.search input');
        let $clear = $el.find('.clear');

        console.log("$clear: ", $clear);

        $search.on({
          keyup: function(event){
            var inputData = $search.val();
            methods.hideOptions($el, inputData, options);

            // show/hide clear icon
            ($search.val().length > 0) ? $clear.removeClass('hide') : $clear.addClass('hide');
          },
          focus: function(event){
            $search.removeClass('glass');
          },
          focusout: function(event){
            ($search.val().length > 0) ? $search.removeClass('glass') : $search.addClass('glass');
          }
        });
      },

      clearSearch: function($el, options){
        let $search = $el.find('.search input');
        let $clear = $el.find('.clear');
        $clear.on({
          click: function(event){
            $search.val('');
            methods.hideOptions($el, $search.val(), options);
            ($search.val().length > 0) ? $clear.removeClass('hide') : $clear.addClass('hide');
            ($search.val().length > 0) ? $search.removeClass('glass') : $search.addClass('glass');
          }
        })
      }
    };


  // jquery component stuff
  $.fn.dwSelect = function(methodOrOptions) {
      if ( api[methodOrOptions] ) {
          return api[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ))
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
          // Default to "init"
          return api.init.apply( this, arguments )
      } else {
          $.error( 'Method ' +  methodOrOptions + ' does not exist on jQuery.dwSelect' )
      }
  };


})( jQuery )
