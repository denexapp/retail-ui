import React from 'react';
import isEqual from 'lodash.isequal';
import warning from 'warning';
import cn from 'classnames';

import { Link } from '../Link';
import { LocaleProvider } from '../LocaleProvider';
import { locale } from '../LocaleProvider/decorators';
import { ThemeConsumer } from '../ThemeConsumer';
import { Theme } from '../../lib/theming/Theme';
import { EditIcon } from '../internal/icons/16px';

import { FiasLocale, FiasLocaleHelper } from './locale';
import { APIProvider, ExtraFields, FiasValue, Fields, FieldsSettings, FormValidation } from './types';
import { FiasModal } from './FiasModal';
import { FiasForm } from './Form/FiasForm';
import { FiasAPI } from './api/FiasAPI';
import { Address } from './models/Address';
import { Logger } from './logger/Logger';
import { jsStyles } from './Fias.styles';

export interface FiasProps {
  /**
   * Значение адреса. См. формат в примерах
   */
  value?: Partial<FiasValue>;
  error?: boolean;
  warning?: boolean;
  /**
   * Сообщение пользователю в режиме `error` или `warning`
   */
  feedback?: string;
  /**
   * Выводить ли текстовую интерпретацию адреса над ссылкой
   */
  showAddressText?: boolean;
  /**
   * Текст ссылки
   */
  label?: string;
  /**
   * Иконка рядом со ссылкой
   */
  icon?: React.ReactElement<any>;
  readonly?: boolean;
  /**
   * API URL. Существует тестовый
   * `https://api.testkontur.ru/fias/v1/` и боевой `https://api.kontur.ru/fias/v1/`
   */
  baseUrl?: string;
  /**
   * API instance. Если нет возможности использовать стандартный API.
   */
  api?: APIProvider;
  /**
   * Позволяет получить полный FiasValue после обработки входного `value`
   */
  onInit?: (value: FiasValue) => void;
  onValueChange?: (value: FiasValue) => void;
  onClose?: () => void;
  /**
   * Добавляет поле поиска адреса в произвольной форме
   */
  search?: boolean;
  /**
   * Количество отображаемых элементов в выпадающих списках
   */
  limit?: number;
  /**
   * Уровень критичности ошибок валидации полей адреса
   */
  formValidation?: FormValidation;
  /**
   * Разрешать ли сохранять неверефицированный (произвольный, не из базы) адрес
   */
  allowNotVerified?: boolean;
  /**
   * Версия базы данных ФИАС. Формат: "2018-10-22"
   */
  version?: string;
  /**
   * Настройка полей. Достаточно переопределить только нужные.
   * Внимание, не рекомендуется скрывать поля в произвольном порядке. Это может привести
   * к невозможности заполнения некоторых адресов.
   * Значение по умолчанию:
   *
   * ```ts
   *  {
   *     region:
   *     ...
   *     room: {
   *       visible: true
   *     },
   *     postalcode: {
   *       visible: false
   *     }
   *  }```
   *
   */
  fieldsSettings: FieldsSettings;
  /* Выбор страны */
  countrySelector: boolean;
}

export interface FiasState {
  opened: boolean;
  address: Address;
  locale: FiasLocale;
  fieldsSettings: FieldsSettings;
}

function deepMerge<T>(dst: T, ...src: T[]): T {
  src.forEach(obj => {
    for (const k in obj) {
      if (dst[k] != null && typeof obj[k] === 'object') {
        dst[k] = deepMerge(dst[k], obj[k]);
      } else {
        dst[k] = obj[k];
      }
    }
  });
  return dst;
}

/**
 * @deprecated Контур-специфичный компонент, будет удален в 3.0.0, перенесен в `@skbkontur/react-ui-addons` смотри [миграцию](https://github.com/skbkontur/retail-ui/blob/master/MIGRATION.md)
 */

@locale('Fias', FiasLocaleHelper)
export class Fias extends React.Component<FiasProps, FiasState> {
  public static __KONTUR_REACT_UI__ = 'Fias';

  public static defaultProps = {
    showAddressText: true,
    error: false,
    warning: false,
    readonly: false,
    search: false,
    icon: <EditIcon />,
    allowNotVerified: true,
    fieldsSettings: {},
    countrySelector: false,
  };

  public state: FiasState = {
    opened: false,
    address: new Address(),
    locale: FiasLocaleHelper.get(),
    fieldsSettings: this.fieldsSettings,
  };

  private theme!: Theme;
  private api: APIProvider = this.props.api || new FiasAPI(this.props.baseUrl, this.props.version);
  private form: FiasForm | null = null;

  private readonly locale!: FiasLocale;

  public constructor(props: FiasProps) {
    super(props);
    warning(
      true,
      `Fias has been deprecated, use Fias from @skbkontur/react-ui-addons instead, see [migration](https://github.com/skbkontur/retail-ui/blob/master/MIGRATION.md)`,
    );
    if (!props.baseUrl && !props.api) {
      Logger.log(Logger.warnings.baseUrlOrApiIsRequired);
    }
  }

  public get fieldsSettings(): FieldsSettings {
    const { fieldsSettings: userSettings, countrySelector } = this.props;
    // TODO: implement deepMerge with clone
    const defaultSettings = Address.ALL_FIELDS.reduce<FieldsSettings>(
      (settings: FieldsSettings, field: Fields | ExtraFields) => ({
        ...settings,
        [field]: {
          visible: true,
        },
      }),
      {},
    );
    return deepMerge<FieldsSettings>(
      defaultSettings,
      {
        [ExtraFields.postalcode]: {
          visible: Boolean(countrySelector),
        },
      },
      userSettings,
    );
  }

  public componentDidMount = () => {
    this.updateLocale();
    this.init();
  };

  public componentDidUpdate = (prevProps: FiasProps, prevState: FiasState) => {
    if (!isEqual(prevProps.value, this.props.value)) {
      this.updateAddress();
    }
    if (!isEqual(prevState.locale, this.locale)) {
      this.updateLocale(this.locale);
    }
    if (!isEqual(prevProps.fieldsSettings, this.props.fieldsSettings)) {
      this.updateFieldsSettings();
    }
  };

  public isFieldVisible(field: Fields | ExtraFields): boolean {
    return Address.isFieldVisible(field, this.state.fieldsSettings);
  }

  public render() {
    return (
      <ThemeConsumer>
        {theme => {
          this.theme = theme;
          return this.renderMain();
        }}
      </ThemeConsumer>
    );
  }

  private renderMain() {
    const { showAddressText, label, icon, error, warning, feedback } = this.props;
    const { opened, address } = this.state;

    const linkText = label || (address.isEmpty ? this.state.locale.addressFill : this.state.locale.addressEdit);

    const validation =
      (error || warning) && feedback ? (
        <span
          className={cn({
            [jsStyles.error(this.theme)]: Boolean(error),
            [jsStyles.warning(this.theme)]: Boolean(warning),
          })}
        >
          {feedback}
        </span>
      ) : null;

    return (
      <LocaleProvider locale={{ Fias: this.state.locale }}>
        <div>
          {showAddressText && <span>{address.getFullText(this.isFieldVisible(ExtraFields.postalcode))}</span>}
          {!this.props.readonly && (
            <div>
              <Link icon={icon} onClick={this.handleOpen}>
                {linkText}
              </Link>
            </div>
          )}
          {validation}
          {opened && this.renderModal()}
        </div>
      </LocaleProvider>
    );
  }

  private renderModal() {
    const { address, fieldsSettings } = this.state;
    const { search, limit, formValidation, countrySelector } = this.props;
    return (
      <FiasModal onClose={this.handleClose} onSave={this.handleSave}>
        <FiasForm
          ref={this.refForm}
          address={address}
          api={this.api}
          search={search}
          limit={limit}
          validationLevel={formValidation}
          fieldsSettings={fieldsSettings}
          countrySelector={countrySelector}
        />
      </FiasModal>
    );
  }

  private init = async () => {
    const address = await this.updateAddress();
    if (this.props.onInit) {
      this.props.onInit(address.getValue(this.isFieldVisible(ExtraFields.postalcode)));
    }
  };

  private updateAddress = async (): Promise<Address> => {
    const address = await Address.getAddress(this.api, this.props.value, this.state.fieldsSettings);
    this.setState({
      address,
    });
    return address;
  };

  private updateLocale = (nextLocale: FiasLocale = FiasLocaleHelper.get()): void => {
    this.setState({ locale: nextLocale });
  };

  private updateFieldsSettings = (): void => {
    this.setState({
      fieldsSettings: this.fieldsSettings,
    });
  };

  private handleOpen = () => {
    this.setState({ opened: true });
  };

  private handleClose = () => {
    this.setState({ opened: false });
    const onClose = this.props.onClose;
    if (onClose) {
      onClose();
    }
  };

  private handleSave = async () => {
    if (this.form) {
      const address = await this.form.submit();
      if (address.hasErrors && this.props.allowNotVerified === false) {
        return;
      }
      this.handleChange(address);
    }
    this.handleClose();
  };

  private handleChange = (address: Address) => {
    if (this.props.onValueChange) {
      this.props.onValueChange(address.getValue(this.isFieldVisible(ExtraFields.postalcode)));
    }
  };

  private refForm = (element: FiasForm | null) => {
    this.form = element;
  };
}
