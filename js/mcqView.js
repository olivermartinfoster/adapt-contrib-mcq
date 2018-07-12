define([
  'core/js/views/questionView'
], function(QuestionView) {

  var McqView = QuestionView.extend({

    events: {
      'focus .js-mcq-item-input': 'onItemFocus',
      'blur .js-mcq-item-input': 'onItemBlur',
      'change .js-mcq-item-input': 'onItemSelected',
      'keyup .js-mcq-item-input': 'onKeyPress'
    },

    resetQuestionOnRevisit: function() {
      this.setAllItemsEnabled(true);
      this.resetQuestion();
    },

    setupQuestion: function() {
      this.model.setupRandomisation();
    },

    disableQuestion: function() {
      this.setAllItemsEnabled(false);
    },

    enableQuestion: function() {
      this.setAllItemsEnabled(true);
    },

    setAllItemsEnabled: function(isEnabled) {
      _.each(this.model.get('_items'), function(item, index){
        var $itemLabel = this.$('.js-mcq-item-label').eq(index);
        var $itemInput = this.$('.js-mcq-item-input').eq(index);

        if (isEnabled) {
          $itemLabel.removeClass('is-disabled');
          $itemInput.prop('disabled', false);
        } else {
          $itemLabel.addClass('is-disabled');
          $itemInput.prop('disabled', true);
        }
      }, this);
    },

    onQuestionRendered: function() {
      this.setReadyStatus();
      if (!this.model.get("_isSubmitted")) return;
      this.showMarking();
    },

    onKeyPress: function(event) {
      if (event.which === 13) { //<ENTER> keypress
        this.onItemSelected(event);
      }
    },

    onItemFocus: function(event) {
      if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
        $(".js-mcq-item-label[for='"+$(event.currentTarget).attr('id')+"']").addClass('is-highlighted');
      }
    },

    onItemBlur: function(event) {
      $(".js-mcq-item-label[for='"+$(event.currentTarget).attr('id')+"']").removeClass('is-highlighted');
    },

    onItemSelected: function(event) {
      if(this.model.get('_isEnabled') && !this.model.get('_isSubmitted')){
        var selectedItemObject = this.model.get('_items')[$(event.currentTarget).parent('.js-mcq-item').index()];
        this.toggleItemSelected(selectedItemObject, event);
      }
    },

    toggleItemSelected:function(item, clickEvent) {
      var selectedItems = this.model.get('_selectedItems');
      var itemIndex = _.indexOf(this.model.get('_items'), item),
        $itemLabel = this.$('.js-mcq-item-label').eq(itemIndex),
        $itemInput = this.$('.js-mcq-item-input').eq(itemIndex),
        selected = !$itemLabel.hasClass('is-selected');

      if(selected) {
        if(this.model.get('_selectable') === 1){
          this.$('.js-mcq-item-label').removeClass('is-selected');
          this.$('.js-mcq-item-input').prop('checked', false);
          this.deselectAllItems();
          selectedItems[0] = item;
        } else if(selectedItems.length < this.model.get('_selectable')) {
          selectedItems.push(item);
        } else {
          clickEvent.preventDefault();
          return;
        }
        $itemLabel.addClass('is-selected');
      } else {
        selectedItems.splice(_.indexOf(selectedItems, item), 1);
        $itemLabel.removeClass('is-selected');
      }
      $itemInput.prop('checked', selected);
      item._isSelected = selected;
      this.model.set('_selectedItems', selectedItems);
    },

    // Blank method to add functionality for when the user cannot submit
    // Could be used for a popup or explanation dialog/hint
    onCannotSubmit: function() {},

    // This is important and should give the user feedback on how they answered the question
    // Normally done through ticks and crosses by adding classes
    showMarking: function() {
      if (!this.model.get('_canShowMarking')) return;

      _.each(this.model.get('_items'), function(item, i) {
        var $item = this.$('.js-mcq-item').eq(i);
        $item.removeClass('is-correct is-incorrect').addClass(item._isCorrect ? 'is-correct' : 'is-incorrect');
      }, this);
    },

    // Used by the question view to reset the look and feel of the component.
    resetQuestion: function() {
      this.deselectAllItems();
      this.resetItems();
    },

    deselectAllItems: function() {
      this.model.deselectAllItems();
    },

    resetItems: function() {
      this.$('.js-mcq-item-label').removeClass('is-selected');
      this.$('.js-mcq-item').removeClass('is-correct is-incorrect');
      this.$('.js-mcq-item-input').prop('checked', false);
      this.model.resetItems();
    },

    showCorrectAnswer: function() {
      _.each(this.model.get('_items'), function(item, index) {
        this.setOptionSelected(index, item._shouldBeSelected);
      }, this);
    },

    setOptionSelected:function(index, selected) {
      var $itemLabel = this.$('.js-mcq-item-label').eq(index);
      var $itemInput = this.$('.js-mcq-item-input').eq(index);
      if (selected) {
        $itemLabel.addClass('is-selected');
        $itemInput.prop('checked', true);
      } else {
        $itemLabel.removeClass('is-selected');
        $itemInput.prop('checked', false);
      }
    },

    hideCorrectAnswer: function() {
      _.each(this.model.get('_items'), function(item, index) {
        this.setOptionSelected(index, this.model.get('_userAnswer')[item._index]);
      }, this);
    }
  });

  return McqView;

});
