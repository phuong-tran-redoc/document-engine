import { DynamicFieldCategory } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Dynamic Fields categorized by type
 */
export const DYNAMIC_FIELDS_CATEGORIES: DynamicFieldCategory[] = [
  {
    key: 'guest_info',
    label: 'Guest information',
    fields: [
      {
        id: 'guest_title',
        label: 'Title',
        description: 'Guest title (Mr, Mrs, etc.)',
      },
      {
        id: 'guest_name',
        label: 'Name',
        description: 'Guest first name',
      },
      {
        id: 'guest_lastname',
        label: 'Last name',
        description: 'Guest last name',
      },
      {
        id: 'guest_discount',
        label: 'Guest discount',
        description: 'Guest discount percentage',
      },
      {
        id: 'hotel_room_photo',
        label: 'Hotel room photo',
        description: 'Room photo image',
      },
    ],
  },
  {
    key: 'reservation_info',
    label: 'Reservation information',
    fields: [
      {
        id: 'reservation_number',
        label: 'Reservation number',
        description: 'Unique reservation ID',
      },
      {
        id: 'check_in_date',
        label: 'Check-in date',
        description: 'Check-in date',
      },
      {
        id: 'check_out_date',
        label: 'Check-out date',
        description: 'Check-out date',
      },
      {
        id: 'room_type',
        label: 'Room type',
        description: 'Type of room booked',
      },
      {
        id: 'number_of_guests',
        label: 'Number of guests',
        description: 'Total number of guests',
      },
    ],
  },
  {
    key: 'payment_info',
    label: 'Payment information',
    fields: [
      {
        id: 'total_amount',
        label: 'Total amount',
        description: 'Total payment amount',
      },
      {
        id: 'payment_method',
        label: 'Payment method',
        description: 'Payment method used',
      },
      {
        id: 'currency',
        label: 'Currency',
        description: 'Payment currency',
      },
      {
        id: 'tax_amount',
        label: 'Tax amount',
        description: 'Tax amount',
      },
    ],
  },
  {
    key: 'hotel_info',
    label: 'Hotel information',
    fields: [
      {
        id: 'hotel_name',
        label: 'Hotel name',
        description: 'Name of the hotel',
      },
      {
        id: 'hotel_address',
        label: 'Hotel address',
        description: 'Hotel address',
      },
      {
        id: 'hotel_phone',
        label: 'Hotel phone',
        description: 'Hotel contact phone',
      },
      {
        id: 'hotel_email',
        label: 'Hotel email',
        description: 'Hotel contact email',
      },
    ],
  },
  {
    key: 'contact_info',
    label: 'Contact information',
    fields: [
      {
        id: 'guest_email',
        label: 'Guest email',
        description: 'Guest email address',
      },
      {
        id: 'guest_phone',
        label: 'Guest phone',
        description: 'Guest phone number',
      },
      {
        id: 'guest_address',
        label: 'Guest address',
        description: 'Guest address',
      },
    ],
  },
];
