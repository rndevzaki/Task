import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Button } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import { colors } from '@/styles/colors';
import { commonStyles } from '@/styles/commonStyles';
import { SortDirection } from '@/types'; // Import common types

interface FilterSortControlsProps<SortField extends string, FilterCriteria> {
  sortOptions: { label: string; value: SortField }[];
  filterOptions?: {
    label: string;
    field: keyof FilterCriteria;
    options: { label: string; value: any }[]; // value can be string, enum, null
  }[];
  currentSort: { field: SortField; direction: SortDirection };
  currentFilters: FilterCriteria;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  onFilterChange: (field: keyof FilterCriteria, value: any) => void;
  onClearFilters: () => void;
}

const FilterSortControls = <SortField extends string, FilterCriteria>({
  sortOptions,
  filterOptions,
  currentSort,
  currentFilters,
  onSortChange,
  onFilterChange,
  onClearFilters,
}: FilterSortControlsProps<SortField, FilterCriteria>) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const handleSortFieldChange = (field: SortField) => {
    // If same field, toggle direction, else default to 'asc'
    const newDirection = currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc';
    onSortChange(field, newDirection);
  };

  const getFilterCount = () => {
      // Ensure currentFilters is an object before trying to get its values
      if (typeof currentFilters !== 'object' || currentFilters === null) {
          return 0;
      }
      return Object.values(currentFilters).filter(value => value !== null && value !== undefined).length;
  };


  const filterCount = getFilterCount();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <Icon name="filter-outline" size={18} color={colors.primary} />
        <Text style={styles.buttonText}>Filter {filterCount > 0 ? `(${filterCount})` : ''}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => handleSortFieldChange(currentSort.field)}>
         <Icon
             name={currentSort.direction === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'}
             size={18}
             color={colors.primary}
         />
         <Text style={styles.buttonText}>Sort By</Text>
         {/* Consider showing current sort field here */}
      </TouchableOpacity>


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>

            {/* Sorting */}
            <Text style={commonStyles.label}>Sort By</Text>
            <View style={styles.sortContainer}>
              {sortOptions.map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.sortButton,
                    currentSort.field === opt.value && styles.sortButtonActive,
                  ]}
                  onPress={() => handleSortFieldChange(opt.value)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      currentSort.field === opt.value && styles.sortButtonTextActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {currentSort.field === opt.value && (
                    <Icon
                      name={currentSort.direction === 'asc' ? 'arrow-up-outline' : 'arrow-down-outline'}
                      size={16}
                      color={colors.white}
                      style={{ marginLeft: 5 }}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Filtering */}
            {filterOptions && filterOptions.map(filterGroup => (
              <View key={filterGroup.label} style={styles.filterGroup}>
                <Text style={commonStyles.label}>{filterGroup.label}</Text>
                {/* Wrap Picker in a View for consistent styling */}
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={(currentFilters as any)[filterGroup.field]}
                    onValueChange={(itemValue) => onFilterChange(filterGroup.field, itemValue)}
                    style={styles.picker} // Apply style directly to Picker
                    itemStyle={styles.pickerItem} // For iOS item styling
                  >
                    {filterGroup.options.map(opt => (
                      <Picker.Item key={opt.value ?? 'all'} label={opt.label} value={opt.value} />
                    ))}
                  </Picker>
                </View>
              </View>
            ))}


            <View style={styles.modalActions}>
               <TouchableOpacity style={[commonStyles.button, commonStyles.buttonSecondary, styles.modalButton]} onPress={() => { onClearFilters(); setModalVisible(false); }}>
                   <Text style={[commonStyles.buttonText, commonStyles.buttonSecondaryText]}>Clear Filters</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[commonStyles.button, styles.modalButton]} onPress={() => setModalVisible(false)}>
                   <Text style={commonStyles.buttonText}>Done</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    marginLeft: 6,
    color: colors.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    padding: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    maxHeight: '80%', // Limit height
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  sortButton: {
    flexDirection: 'row',
    backgroundColor: colors.greyLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  sortButtonTextActive: {
    color: colors.white,
    fontWeight: 'bold',
  },
  filterGroup: {
    marginBottom: 15,
  },
  pickerWrapper: { // Added wrapper for consistent border/background
      borderWidth: 1,
      borderColor: colors.divider,
      borderRadius: 4,
      backgroundColor: colors.white,
      height: 50, // Explicit height for wrapper can help consistency
      justifyContent: 'center',
  },
  picker: {
      width: '100%', // Ensure picker fills wrapper
      height: '100%', // Ensure picker fills wrapper
      color: colors.text, // Ensure text color is applied
  },
  pickerItem: {
      // iOS only: Style for individual picker items if needed
      // height: 120, // Example height, adjust as needed
      // fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
      flex: 1, // Make buttons take equal space
      marginHorizontal: 5,
  }
});

export default FilterSortControls;
