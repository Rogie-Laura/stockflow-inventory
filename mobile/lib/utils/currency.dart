import 'package:intl/intl.dart';

final _peso = NumberFormat.currency(locale: 'en_PH', symbol: '₱');

String formatPeso(num value) => _peso.format(value);
